import type { Page } from "playwright";
import type { ComplianceMode, NormalizedFindingInput } from "@/lib/types";
import { sanitizeHtmlSnippet } from "@/lib/utils";
import { getWcagReferencesForRule } from "@/lib/wcag";

interface CustomCheckContext {
  scanId: string;
  projectId: string;
  pageId: string;
  url: string;
  viewport: "desktop" | "mobile" | "responsive";
  mode: ComplianceMode;
  screenshotPath?: string;
}

interface BrowserCheck {
  issueKey: string;
  title: string;
  description: string;
  selector?: string;
  htmlSnippet?: string;
  severity: "critical" | "serious" | "moderate" | "minor" | "needs-review";
  confidence: "high" | "medium" | "low";
  source: "automated" | "visual" | "needs-review";
  fix: string;
  tests: string[];
}

export async function runCustomChecks(page: Page, context: CustomCheckContext): Promise<NormalizedFindingInput[]> {
  const checks = await page.evaluate<BrowserCheck[]>(() => {
    const selectorFor = (element: Element) => {
      if (element.id) return `#${CSS.escape(element.id)}`;
      const attr = element.getAttribute("name") || element.getAttribute("aria-label");
      if (attr) return `${element.tagName.toLowerCase()}[name="${attr}"]`;
      const classes = Array.from(element.classList).slice(0, 2).map((item) => `.${CSS.escape(item)}`).join("");
      return `${element.tagName.toLowerCase()}${classes}`;
    };

    const snippet = (element: Element) => element.outerHTML.slice(0, 900);
    const findings: BrowserCheck[] = [];
    const push = (check: BrowserCheck) => findings.push(check);

    if (!document.documentElement.getAttribute("lang")) {
      push({
        issueKey: "html-has-lang",
        title: "Page language is missing",
        description: "The html element does not declare a page language.",
        selector: "html",
        htmlSnippet: document.documentElement.outerHTML.slice(0, 120),
        severity: "serious",
        confidence: "high",
        source: "automated",
        fix: "Add a valid lang attribute to the html element.",
        tests: ["Inspect <html lang>.", "Run axe html-has-lang."]
      });
    }

    if (!document.title.trim()) {
      push({
        issueKey: "document-title",
        title: "Page title is missing",
        description: "The document title is empty.",
        selector: "title",
        severity: "serious",
        confidence: "high",
        source: "automated",
        fix: "Provide a concise, unique page title.",
        tests: ["Check the browser tab title.", "Run axe document-title."]
      });
    }

    const headings = Array.from(document.querySelectorAll("h1,h2,h3,h4,h5,h6"));
    let previousLevel = 0;
    for (const heading of headings) {
      const level = Number(heading.tagName.slice(1));
      if (previousLevel && level > previousLevel + 1) {
        push({
          issueKey: "heading-order",
          title: "Heading hierarchy skips a level",
          description: `A heading jumps from h${previousLevel} to h${level}.`,
          selector: selectorFor(heading),
          htmlSnippet: snippet(heading),
          severity: "moderate",
          confidence: "medium",
          source: "automated",
          fix: "Use heading levels in order to communicate page structure.",
          tests: ["Review the headings outline.", "Navigate by headings with a screen reader."]
        });
        break;
      }
      previousLevel = level;
    }

    if (!document.querySelector("main,[role='main']")) {
      push({
        issueKey: "main-landmark",
        title: "Main landmark is missing",
        description: "The page does not expose a main landmark.",
        selector: "body",
        severity: "moderate",
        confidence: "high",
        source: "automated",
        fix: "Wrap the primary page content in <main> or role=\"main\".",
        tests: ["Use screen reader landmark navigation.", "Run landmark checks."]
      });
    }

    if (!document.querySelector("a[href^='#']:not([href='#'])")) {
      push({
        issueKey: "skip-link",
        title: "Skip link was not detected",
        description: "A rendered same-page skip link was not found.",
        severity: "needs-review",
        confidence: "medium",
        source: "needs-review",
        fix: "Provide a keyboard-accessible skip link that moves focus to main content.",
        tests: ["Reload the page.", "Press Tab once and verify a skip link appears and works."]
      });
    }

    for (const element of Array.from(document.querySelectorAll("a,button")).slice(0, 120)) {
      const text = (element.textContent || "").trim();
      const label = element.getAttribute("aria-label") || element.getAttribute("title") || "";
      if (!text && !label && !element.querySelector("img[alt],svg[aria-label],svg title")) {
        push({
          issueKey: element.tagName.toLowerCase() === "a" ? "link-name" : "button-name",
          title: `${element.tagName.toLowerCase()} has no accessible name`,
          description: "Interactive controls need meaningful accessible names.",
          selector: selectorFor(element),
          htmlSnippet: snippet(element),
          severity: "serious",
          confidence: "high",
          source: "automated",
          fix: "Add visible text or an accessible name that describes the action or destination.",
          tests: ["Inspect the accessibility tree.", "Run axe name checks."]
        });
      }
    }

    for (const iframe of Array.from(document.querySelectorAll("iframe")).slice(0, 40)) {
      if (!iframe.getAttribute("title")) {
        push({
          issueKey: "frame-title",
          title: "Iframe is missing a title",
          description: "Iframe content must be identified by an accessible title.",
          selector: selectorFor(iframe),
          htmlSnippet: snippet(iframe),
          severity: "serious",
          confidence: "high",
          source: "automated",
          fix: "Add a concise title that identifies the iframe content.",
          tests: ["Run axe frame-title.", "Navigate frames with a screen reader."]
        });
      }
    }

    for (const link of Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href]")).slice(0, 300)) {
      const href = link.href.toLowerCase();
      if (href.endsWith(".pdf") || href.includes(".pdf?")) {
        push({
          issueKey: "pdf-review",
          title: "PDF or document link requires manual accessibility review",
          description: "Linked documents need separate accessibility verification.",
          selector: selectorFor(link),
          htmlSnippet: snippet(link),
          severity: "needs-review",
          confidence: "medium",
          source: "needs-review",
          fix: "Audit document tags, language, reading order, headings, alt text, tables, forms, and metadata.",
          tests: ["Run a PDF accessibility checker.", "Test reading order with a screen reader."]
        });
      }
    }

    for (const media of Array.from(document.querySelectorAll<HTMLMediaElement>("video,audio")).slice(0, 60)) {
      const hasTrack = Boolean(media.querySelector("track[kind='captions'],track[kind='subtitles']"));
      if (media.tagName.toLowerCase() === "video" && !hasTrack) {
        push({
          issueKey: "captions-review",
          title: "Video captions require review",
          description: "A video element was found without caption or subtitle tracks.",
          selector: selectorFor(media),
          htmlSnippet: snippet(media),
          severity: "needs-review",
          confidence: "medium",
          source: "needs-review",
          fix: "Provide accurate captions and transcript alternatives for prerecorded media.",
          tests: ["Play the video.", "Verify captions are present and accurate."]
        });
      }
      if (media.autoplay && !media.muted) {
        push({
          issueKey: "autoplay-media",
          title: "Autoplay media may need pause controls",
          description: "Autoplaying media can interfere with screen readers and concentration.",
          selector: selectorFor(media),
          htmlSnippet: snippet(media),
          severity: "moderate",
          confidence: "medium",
          source: "needs-review",
          fix: "Avoid autoplay with sound or provide visible pause/stop controls.",
          tests: ["Load the page.", "Confirm media can be paused, stopped, or hidden."]
        });
      }
    }

    for (const element of Array.from(document.querySelectorAll<HTMLElement>("button,a,input,select,textarea,[role='button'],[tabindex]")).slice(0, 250)) {
      const rect = element.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0 && (rect.width < 24 || rect.height < 24)) {
        push({
          issueKey: "target-size",
          title: "Interactive target may be too small",
          description: "The control is below the WCAG 2.2 AA target size minimum of 24 by 24 CSS pixels.",
          selector: selectorFor(element),
          htmlSnippet: snippet(element),
          severity: "moderate",
          confidence: "medium",
          source: "visual",
          fix: "Increase target dimensions or spacing to at least 24 CSS pixels.",
          tests: ["Measure target size at mobile and desktop viewports.", "Confirm adjacent controls have sufficient spacing."]
        });
      }
    }

    if (document.querySelector("[class*='captcha' i], iframe[src*='captcha' i], [id*='captcha' i]")) {
      push({
        issueKey: "captcha-review",
        title: "CAPTCHA requires accessibility review",
        description: "CAPTCHA experiences often need accessible alternatives and support workflows.",
        severity: "needs-review",
        confidence: "medium",
        source: "needs-review",
        fix: "Provide accessible CAPTCHA alternatives and non-visual challenge options.",
        tests: ["Complete the flow with keyboard only.", "Test with screen reader.", "Confirm support fallback."]
      });
    }

    return findings;
  });

  return checks.map((check) => ({
    scanId: context.scanId,
    projectId: context.projectId,
    pageId: context.pageId,
    url: context.url,
    viewport: context.viewport,
    title: check.title,
    issueKey: check.issueKey,
    description: check.description,
    selector: check.selector,
    htmlSnippet: sanitizeHtmlSnippet(check.htmlSnippet),
    severity: check.severity,
    confidence: check.confidence,
    source: check.source,
    wcag: getWcagReferencesForRule(check.issueKey, context.mode),
    screenshotPath: context.screenshotPath,
    remediation: {
      plainEnglish: check.title,
      accessibilityImpact: check.description,
      fix: check.fix,
      tests: check.tests
    },
    stepsToReproduce: [`Open ${context.url}.`, "Run Access Audit custom checks.", check.selector ? `Inspect ${check.selector}.` : "Review the page manually."]
  }));
}

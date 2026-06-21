import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Page } from "playwright";
import type { ComplianceMode, NormalizedFindingInput } from "@/lib/types";
import { getWcagReferencesForRule } from "@/lib/wcag";

interface KeyboardContext {
  scanId: string;
  projectId: string;
  pageId: string;
  url: string;
  mode: ComplianceMode;
  artifactDir: string;
}

interface FocusStep {
  index: number;
  selector: string;
  tagName: string;
  name: string;
  role: string;
  x: number;
  y: number;
  width: number;
  height: number;
  visibleFocus: boolean;
}

export async function exploreKeyboard(page: Page, context: KeyboardContext) {
  const steps: FocusStep[] = [];
  const findings: NormalizedFindingInput[] = [];
  const screenshotsDir = path.join(context.artifactDir, "focus");
  await mkdir(screenshotsDir, { recursive: true });

  for (let index = 0; index < 60; index += 1) {
    await page.keyboard.press("Tab");
    await page.waitForTimeout(40);
    const step = await page.evaluate<FocusStep | null>((stepIndex) => {
      const active = document.activeElement;
      if (!active || active === document.body || !(active instanceof HTMLElement)) return null;
      const selectorFor = (element: Element) => {
        if (element.id) return `#${CSS.escape(element.id)}`;
        const attr = element.getAttribute("name") || element.getAttribute("aria-label");
        if (attr) return `${element.tagName.toLowerCase()}[name="${attr}"]`;
        const classes = Array.from(element.classList).slice(0, 2).map((item) => `.${CSS.escape(item)}`).join("");
        return `${element.tagName.toLowerCase()}${classes}`;
      };
      const rect = active.getBoundingClientRect();
      const style = getComputedStyle(active);
      const hasOutline = style.outlineStyle !== "none" && Number.parseFloat(style.outlineWidth || "0") > 0;
      const hasShadow = style.boxShadow !== "none";
      const hasRing = style.borderStyle !== "none" && Number.parseFloat(style.borderWidth || "0") > 1;
      return {
        index: stepIndex,
        selector: selectorFor(active),
        tagName: active.tagName.toLowerCase(),
        name: active.getAttribute("aria-label") || active.textContent?.trim().slice(0, 80) || "",
        role: active.getAttribute("role") || "",
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        visibleFocus: Boolean(hasOutline || hasShadow || hasRing)
      };
    }, index);

    if (!step) continue;
    steps.push(step);

    if (!step.visibleFocus) {
      findings.push(buildKeyboardFinding(context, {
        issueKey: "focus-visible",
        title: "Focused element may not have a visible focus indicator",
        description: "The keyboard explorer focused an element without detecting outline, shadow, or a strong border.",
        selector: step.selector,
        severity: "serious",
        fix: "Add a high-contrast :focus-visible style for interactive controls.",
        tests: ["Tab to the control.", "Confirm focus indicator is visible at 100% and 200% zoom."]
      }));
    }

    if (index < 12) {
      const handle = await page.evaluateHandle(() => document.activeElement);
      const element = handle.asElement();
      if (element) {
        const file = path.join(screenshotsDir, `focus-${String(index).padStart(2, "0")}.png`);
        await element.screenshot({ path: file }).catch(() => undefined);
      }
      await handle.dispose();
    }
  }

  const repeated = detectLikelyLoop(steps);
  if (repeated) {
    findings.push(buildKeyboardFinding(context, {
      issueKey: "keyboard-trap",
      title: "Keyboard focus may be trapped",
      description: `Focus repeatedly returned to ${repeated}.`,
      selector: repeated,
      severity: "critical",
      fix: "Ensure users can leave the component with Tab, Shift+Tab, and Escape where appropriate.",
      tests: ["Tab forward and backward through the component.", "Press Escape for dialogs and menus."]
    }));
  }

  await writeFile(path.join(context.artifactDir, "focus-order.json"), JSON.stringify(steps, null, 2), "utf8");
  return { steps, findings };
}

function detectLikelyLoop(steps: FocusStep[]) {
  const last = steps.slice(-20).map((step) => step.selector);
  const counts = new Map<string, number>();
  for (const selector of last) counts.set(selector, (counts.get(selector) ?? 0) + 1);
  for (const [selector, count] of counts) {
    if (count >= 4 && new Set(last).size <= 6) return selector;
  }
  return undefined;
}

function buildKeyboardFinding(
  context: KeyboardContext,
  issue: {
    issueKey: string;
    title: string;
    description: string;
    selector: string;
    severity: "critical" | "serious" | "moderate";
    fix: string;
    tests: string[];
  }
): NormalizedFindingInput {
  return {
    scanId: context.scanId,
    projectId: context.projectId,
    pageId: context.pageId,
    url: context.url,
    viewport: "desktop",
    title: issue.title,
    issueKey: issue.issueKey,
    description: issue.description,
    selector: issue.selector,
    severity: issue.severity,
    confidence: "medium",
    source: "keyboard",
    wcag: getWcagReferencesForRule(issue.issueKey, context.mode),
    remediation: {
      plainEnglish: issue.title,
      accessibilityImpact: issue.description,
      fix: issue.fix,
      tests: issue.tests
    },
    stepsToReproduce: [`Open ${context.url}.`, "Use Tab to move through the page.", `Observe focus behavior around ${issue.selector}.`]
  };
}

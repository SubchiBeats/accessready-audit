import { randomUUID } from "node:crypto";
import type {
  Finding,
  FindingInstance,
  NormalizedFindingInput,
  RemediationGuidance,
  Severity
} from "@/lib/types";
import { sanitizeHtmlSnippet } from "@/lib/utils";
import { getWcagReferencesForRule } from "@/lib/wcag";
import type { ComplianceMode } from "@/lib/types";

interface AxeNode {
  target?: string[];
  html?: string;
  failureSummary?: string;
}

interface AxeViolation {
  id: string;
  impact?: "minor" | "moderate" | "serious" | "critical" | null;
  description: string;
  help: string;
  helpUrl?: string;
  nodes: AxeNode[];
}

export function normalizeAxeViolations(params: {
  violations: AxeViolation[];
  scanId: string;
  projectId: string;
  pageId: string;
  url: string;
  viewport: "desktop" | "mobile" | "responsive";
  mode: ComplianceMode;
  screenshotPath?: string;
}): NormalizedFindingInput[] {
  return params.violations.flatMap((violation) => {
    const severity = axeImpactToSeverity(violation.impact);
    const wcag = getWcagReferencesForRule(violation.id, params.mode);
    const remediation = remediationForRule(violation.id, violation.help);
    const nodes = violation.nodes.length ? violation.nodes : [{}];

    return nodes.map((node) => ({
      scanId: params.scanId,
      projectId: params.projectId,
      pageId: params.pageId,
      url: params.url,
      viewport: params.viewport,
      title: violation.help,
      issueKey: violation.id,
      description: violation.description,
      selector: node.target?.join(", "),
      htmlSnippet: sanitizeHtmlSnippet(node.html),
      severity,
      confidence: "high",
      source: "automated",
      wcag,
      screenshotPath: params.screenshotPath,
      remediation,
      stepsToReproduce: [
        `Open ${params.url}.`,
        `Run axe-core rule "${violation.id}".`,
        node.target?.length ? `Inspect selector ${node.target.join(", ")}.` : "Inspect the flagged element."
      ]
    }));
  });
}

export function materializeFindings(inputs: NormalizedFindingInput[]) {
  const now = new Date().toISOString();
  const grouped = new Map<string, NormalizedFindingInput[]>();

  for (const input of inputs) {
    const key = [input.projectId, input.issueKey, input.selector ?? "", input.templateKey ?? ""].join("::");
    const bucket = grouped.get(key) ?? [];
    bucket.push(input);
    grouped.set(key, bucket);
  }

  const findings: Finding[] = [];
  const instances: FindingInstance[] = [];

  for (const bucket of grouped.values()) {
    const first = bucket[0];
    const findingId = `finding-${randomUUID()}`;
    findings.push({
      id: findingId,
      projectId: first.projectId,
      scanId: first.scanId,
      title: first.title,
      issueKey: first.issueKey,
      description: first.description,
      whyItMatters: impactForIssue(first.issueKey),
      whoItAffects: affectedUsersForIssue(first.issueKey),
      severity: mostSevere(bucket.map((item) => item.severity)),
      confidence: first.confidence,
      source: first.source,
      wcag: first.wcag,
      adaMapping: "Potential ADA web accessibility risk. Confirm applicability with expert review.",
      section508Mapping: "Map to Section 508 through the referenced WCAG criteria where applicable.",
      selector: first.selector,
      htmlSnippet: first.htmlSnippet,
      status: first.source === "needs-review" ? "needs-review" : "open",
      remediation: first.remediation,
      stepsToReproduce: first.stepsToReproduce,
      templateKey: first.templateKey,
      componentName: first.componentName,
      firstSeenAt: now,
      lastSeenAt: now
    });

    for (const input of bucket) {
      instances.push({
        id: `instance-${randomUUID()}`,
        findingId,
        scanId: input.scanId,
        pageId: input.pageId,
        projectId: input.projectId,
        url: input.url,
        selector: input.selector,
        htmlSnippet: input.htmlSnippet,
        screenshotPath: input.screenshotPath,
        viewport: input.viewport,
        impact: input.severity,
        createdAt: now
      });
    }
  }

  return { findings, instances };
}

export function axeImpactToSeverity(impact?: AxeViolation["impact"]): Severity {
  if (impact === "critical") return "critical";
  if (impact === "serious") return "serious";
  if (impact === "moderate") return "moderate";
  if (impact === "minor") return "minor";
  return "needs-review";
}

export function remediationForRule(ruleId: string, label: string): RemediationGuidance {
  const map: Record<string, RemediationGuidance> = {
    "image-alt": {
      plainEnglish: "Images that communicate meaning need text alternatives.",
      accessibilityImpact: "Screen reader users need an equivalent way to understand the image purpose.",
      fix: "Add concise, contextual alt text. Use empty alt text only for decorative images.",
      exampleCode: '<img src="/team.jpg" alt="Customer support team reviewing an order dashboard" />',
      tests: ["Inspect the accessibility tree.", "Run axe image-alt.", "Confirm decorative images use alt=\"\"."]
    },
    label: {
      plainEnglish: "Form controls need accessible labels.",
      accessibilityImpact: "Screen reader and speech input users need programmatic names for fields.",
      fix: "Connect each input to visible label text using htmlFor/id or aria-labelledby.",
      exampleCode: '<label for="email">Email address</label>\n<input id="email" name="email" type="email" />',
      tests: ["Run axe label checks.", "Use a screen reader to confirm the field name is announced."]
    },
    "color-contrast": {
      plainEnglish: "Text contrast is too low.",
      accessibilityImpact: "Low-vision users may be unable to read the content.",
      fix: "Update foreground/background color tokens to meet at least 4.5:1 for normal text.",
      tests: ["Run axe color-contrast.", "Verify contrast at desktop and mobile breakpoints."]
    },
    "aria-hidden-focus": {
      plainEnglish: "Focusable content is hidden from assistive technology.",
      accessibilityImpact: "Keyboard users can land on controls that screen readers do not announce.",
      fix: "Remove focusable controls from aria-hidden regions or use inert when content is unavailable.",
      tests: ["Tab through the component.", "Inspect name, role, and state in the accessibility tree."]
    },
    "button-name": {
      plainEnglish: "A button has no accessible name.",
      accessibilityImpact: "Users cannot determine what action the button performs.",
      fix: "Provide visible text, aria-label, or aria-labelledby that describes the action.",
      exampleCode: '<button type="button" aria-label="Close dialog">×</button>',
      tests: ["Run axe button-name.", "Check that speech input can target the button by name."]
    },
    "link-name": {
      plainEnglish: "A link has no accessible name.",
      accessibilityImpact: "Screen reader link lists become unusable when links are unnamed.",
      fix: "Add meaningful link text or an accessible name that describes the destination.",
      tests: ["Run axe link-name.", "Review links out of context."]
    }
  };

  return (
    map[ruleId] ?? {
      plainEnglish: label,
      accessibilityImpact:
        "This can prevent disabled users from understanding, operating, or trusting the affected interface.",
      fix: "Follow the referenced WCAG success criteria and verify with browser, keyboard, and assistive technology checks.",
      tests: ["Re-run the automated rule.", "Test with keyboard only.", "Review the accessibility tree."]
    }
  );
}

function mostSevere(severities: Severity[]) {
  const order: Severity[] = ["critical", "serious", "moderate", "minor", "needs-review"];
  return order.find((severity) => severities.includes(severity)) ?? "needs-review";
}

function affectedUsersForIssue(issueKey: string) {
  if (issueKey.includes("keyboard") || issueKey.includes("focus") || issueKey.includes("tab")) {
    return ["Keyboard users", "Screen reader users", "Switch-control users"];
  }
  if (issueKey.includes("contrast") || issueKey.includes("reflow") || issueKey.includes("target")) {
    return ["Low-vision users", "Mobile users", "Users with motor disabilities"];
  }
  if (issueKey.includes("caption") || issueKey.includes("audio") || issueKey.includes("video")) {
    return ["Deaf users", "Hard-of-hearing users", "Users in sound-off environments"];
  }
  return ["Screen reader users", "Keyboard users", "People with cognitive or motor disabilities"];
}

function impactForIssue(issueKey: string) {
  if (issueKey.includes("keyboard-trap")) {
    return "A keyboard trap can block people from completing the page or leaving the component.";
  }
  if (issueKey.includes("color-contrast")) {
    return "Low contrast makes text and controls difficult or impossible to perceive.";
  }
  if (issueKey.includes("label")) {
    return "Missing labels make forms difficult to understand and complete with assistive technology.";
  }
  if (issueKey.includes("pdf")) {
    return "Documents require separate accessibility checks for tags, reading order, structure, and metadata.";
  }
  return "The affected content may not be perceivable, operable, understandable, or robust for disabled users.";
}

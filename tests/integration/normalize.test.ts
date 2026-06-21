import { describe, expect, it } from "vitest";
import { materializeFindings, normalizeAxeViolations } from "@/lib/scanner/normalize";

describe("scan normalization", () => {
  it("converts axe violations into grouped findings and instances", () => {
    const inputs = normalizeAxeViolations({
      violations: [
        {
          id: "label",
          impact: "serious",
          description: "Ensures every form element has a label.",
          help: "Form elements must have labels",
          nodes: [
            { target: ["#email"], html: "<input id=\"email\" />" },
            { target: ["#search"], html: "<input id=\"search\" />" }
          ]
        }
      ],
      scanId: "scan-1",
      projectId: "project-1",
      pageId: "page-1",
      url: "https://example.com",
      viewport: "desktop",
      mode: "wcag22-aa"
    });

    const result = materializeFindings(inputs);
    expect(result.findings).toHaveLength(2);
    expect(result.instances).toHaveLength(2);
    expect(result.findings[0].wcag.some((ref) => ref.criterion === "3.3.2")).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import { describeComplianceMode, getWcagReferencesForRule } from "@/lib/wcag";

describe("WCAG mapping", () => {
  it("maps axe rules to WCAG references", () => {
    const refs = getWcagReferencesForRule("color-contrast", "wcag22-aa");
    expect(refs[0].criterion).toBe("1.4.3");
    expect(refs[0].standard).toBe("WCAG 2.2");
  });

  it("maps Section 508 mode to Section 508 references", () => {
    const refs = getWcagReferencesForRule("label", "section508");
    expect(refs.some((ref) => ref.standard === "Section 508")).toBe(true);
  });

  it("describes ADA-aligned WCAG 2.1 mode honestly", () => {
    expect(describeComplianceMode("wcag21-aa")).toContain("ADA Title II");
  });
});

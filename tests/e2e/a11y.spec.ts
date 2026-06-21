import { AxeBuilder } from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("AccessAudit dashboard has no critical or serious axe violations", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  const highImpact = results.violations.filter((violation) => ["critical", "serious"].includes(violation.impact ?? ""));
  expect(highImpact).toEqual([]);
});

import { AxeBuilder } from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import path from "node:path";
import { pathToFileURL } from "node:url";

test("flawed fixture produces known accessibility violations", async ({ page }) => {
  const fixtureUrl = pathToFileURL(path.join(process.cwd(), "fixtures", "flawed-site", "index.html")).toString();
  await page.goto(fixtureUrl);
  const results = await new AxeBuilder({ page }).analyze();
  const ruleIds = new Set(results.violations.map((violation) => violation.id));

  expect(ruleIds.has("html-has-lang")).toBe(true);
  expect(ruleIds.has("document-title")).toBe(true);
  expect(ruleIds.has("image-alt")).toBe(true);
  expect(ruleIds.has("label")).toBe(true);
});

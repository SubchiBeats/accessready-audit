import { expect, test } from "@playwright/test";

test("dashboard exposes core audit workflow", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Accessibility risk dashboard" })).toBeVisible();
  await expect(page.getByRole("link", { name: /New Scan/i }).first()).toBeVisible();
  await expect(page.getByText("Automated scanning alone does not prove")).toBeVisible();
  await page.getByRole("link", { name: /Findings/i }).click();
  await expect(page.getByRole("heading", { name: "Audit findings" })).toBeVisible();
});

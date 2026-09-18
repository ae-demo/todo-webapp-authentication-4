// spec: tests/validation/test-plan.md § AC-004-b
import { test, expect } from "@playwright/test";
import { signIn } from "../lib/auth";

test("AC-004-b: marking a done entry not-done reverts its displayed state", async ({ page }) => {
  const title = `validate ac-004-b ${Date.now()}`;
  // 1. Sign in, create an entry, and mark it done
  await signIn(page);
  await page.getByRole("button", { name: "Add entry" }).click();
  await page.getByRole("textbox", { name: "Title" }).fill(title);
  await page.getByRole("button", { name: "Save" }).click();
  const checkbox = page.getByRole("checkbox", { name: `Mark "${title}" done` });
  await expect(checkbox).toBeVisible();
  await checkbox.click();
  await expect(checkbox).toBeChecked();
  // 2. Mark it not-done again
  await checkbox.click();
  // 3. Assert its displayed state reverts
  await expect(checkbox).not.toBeChecked();
});

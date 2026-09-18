// spec: tests/validation/test-plan.md § AC-005-a
import { test, expect } from "@playwright/test";
import { signIn } from "../lib/auth";

test("AC-005-a: editing an entry's title and saving updates the title shown in the list", async ({ page }) => {
  const stamp = Date.now();
  const originalTitle = `validate ac-005-a original ${stamp}`;
  const newTitle = `validate ac-005-a edited ${stamp}`;
  // 1. Sign in and create an entry
  await signIn(page);
  await page.getByRole("button", { name: "Add entry" }).click();
  await page.getByRole("textbox", { name: "Title" }).fill(originalTitle);
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("row", { name: new RegExp(originalTitle) })).toBeVisible();
  // 2. Edit its title
  await page.getByRole("button", { name: `Edit "${originalTitle}"` }).click();
  await page.getByRole("textbox", { name: "Title" }).fill(newTitle);
  await page.getByRole("button", { name: "Save" }).click();
  // 3. Assert the new title is shown and the old one is gone
  await expect(page.getByRole("row", { name: new RegExp(newTitle) })).toBeVisible();
  await expect(page.getByRole("row", { name: new RegExp(originalTitle) })).toHaveCount(0);
});

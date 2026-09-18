// spec: tests/validation/test-plan.md § AC-006-a
import { test, expect } from "@playwright/test";
import { signIn } from "../lib/auth";

test("AC-006-a: deleting an entry removes it from the user's list", async ({ page }) => {
  const title = `validate ac-006-a ${Date.now()}`;
  // 1. Sign in and create an entry
  await signIn(page);
  await page.getByRole("button", { name: "Add entry" }).click();
  await page.getByRole("textbox", { name: "Title" }).fill(title);
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("row", { name: new RegExp(title) })).toBeVisible();
  // 2. Delete it and confirm
  await page.getByRole("button", { name: `Delete "${title}"` }).click();
  await page.getByRole("dialog", { name: "Delete entry" }).getByRole("button", { name: "Delete" }).click();
  // 3. Assert it is gone from the list
  await expect(page.getByRole("row", { name: new RegExp(title) })).toHaveCount(0);
});

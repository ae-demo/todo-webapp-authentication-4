// spec: tests/validation/test-plan.md § AC-006-b
import { test, expect } from "@playwright/test";
import { signIn, logout } from "../lib/auth";

test("AC-006-b: a deleted entry does not reappear after signing out and back in", async ({ page }) => {
  test.slow(); // two full sign-in round trips; the session check is occasionally slow live
  const title = `validate ac-006-b ${Date.now()}`;
  // 1. Sign in, create an entry, then delete + confirm it
  await signIn(page);
  await page.getByRole("button", { name: "Add entry" }).click();
  await page.getByRole("textbox", { name: "Title" }).fill(title);
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("row", { name: new RegExp(title) })).toBeVisible();
  await page.getByRole("button", { name: `Delete "${title}"` }).click();
  await page.getByRole("dialog", { name: "Delete entry" }).getByRole("button", { name: "Delete" }).click();
  await expect(page.getByRole("row", { name: new RegExp(title) })).toHaveCount(0);
  // 2. Sign out and back in
  await logout(page);
  await signIn(page);
  // 3. Assert the deleted entry does not reappear
  await expect(page.getByRole("row", { name: new RegExp(title) })).toHaveCount(0);
});

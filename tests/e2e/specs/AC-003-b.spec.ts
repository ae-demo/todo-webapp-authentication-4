// spec: tests/validation/test-plan.md § AC-003-b
import { test, expect } from "@playwright/test";
import { signIn, logout } from "../lib/auth";

test("AC-003-b: the list persists and reappears unchanged after sign out and back in", async ({ page }) => {
  test.slow(); // two full sign-in round trips; the session check is occasionally slow live
  const title = `validate ac-003-b ${Date.now()}`;
  // 1. Sign in and create an entry
  await signIn(page);
  await page.getByRole("button", { name: "Add entry" }).click();
  await page.getByRole("textbox", { name: "Title" }).fill(title);
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("row", { name: new RegExp(title) })).toBeVisible();
  // 2. Sign out and back in
  await logout(page);
  await signIn(page);
  // 3. Assert the entry reappears unchanged
  await expect(page.getByRole("row", { name: new RegExp(title) })).toBeVisible();
});

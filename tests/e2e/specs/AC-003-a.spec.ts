// spec: tests/validation/test-plan.md § AC-003-a
import { test, expect } from "@playwright/test";
import { signIn } from "../lib/auth";

test("AC-003-a: the list view shows every entry the user has created", async ({ page }) => {
  const stamp = Date.now();
  const titleA = `validate ac-003-a-1 ${stamp}`;
  const titleB = `validate ac-003-a-2 ${stamp}`;
  // 1. Sign in
  await signIn(page);
  // 2. Create two entries
  for (const title of [titleA, titleB]) {
    await page.getByRole("button", { name: "Add entry" }).click();
    await page.getByRole("textbox", { name: "Title" }).fill(title);
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByRole("row", { name: new RegExp(title) })).toBeVisible();
  }
  // 3. Assert both are visible together
  await expect(page.getByRole("row", { name: new RegExp(titleA) })).toBeVisible();
  await expect(page.getByRole("row", { name: new RegExp(titleB) })).toBeVisible();
});

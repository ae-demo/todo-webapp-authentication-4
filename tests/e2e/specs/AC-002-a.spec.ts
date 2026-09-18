// spec: tests/validation/test-plan.md § AC-002-a
import { test, expect } from "@playwright/test";
import { signIn } from "../lib/auth";

test("AC-002-a: submitting a title creates a new entry visible in the list", async ({ page }) => {
  const title = `validate ac-002-a ${Date.now()}`;
  // 1. Sign in
  await signIn(page);
  // 2. Add a new entry with a unique title
  await page.getByRole("button", { name: "Add entry" }).click();
  await page.getByRole("textbox", { name: "Title" }).fill(title);
  await page.getByRole("button", { name: "Save" }).click();
  // 3. Assert the entry is visible in the list
  await expect(page.getByRole("row", { name: new RegExp(title) })).toBeVisible();
});

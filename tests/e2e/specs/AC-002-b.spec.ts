// spec: tests/validation/test-plan.md § AC-002-b
import { test, expect } from "@playwright/test";
import { signIn } from "../lib/auth";

test("AC-002-b: a newly created entry starts as not-done", async ({ page }) => {
  const title = `validate ac-002-b ${Date.now()}`;
  // 1. Sign in
  await signIn(page);
  // 2. Add a new entry
  await page.getByRole("button", { name: "Add entry" }).click();
  await page.getByRole("textbox", { name: "Title" }).fill(title);
  await page.getByRole("button", { name: "Save" }).click();
  // 3. Assert its done checkbox starts unchecked
  const checkbox = page.getByRole("checkbox", { name: `Mark "${title}" done` });
  await expect(checkbox).toBeVisible();
  await expect(checkbox).not.toBeChecked();
});

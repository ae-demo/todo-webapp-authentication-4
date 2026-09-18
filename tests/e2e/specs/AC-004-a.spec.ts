// spec: tests/validation/test-plan.md § AC-004-a
import { test, expect } from "@playwright/test";
import { signIn } from "../lib/auth";

test("AC-004-a: marking an entry done updates its displayed state to done", async ({ page }) => {
  const title = `validate ac-004-a ${Date.now()}`;
  // 1. Sign in and create an entry
  await signIn(page);
  await page.getByRole("button", { name: "Add entry" }).click();
  await page.getByRole("textbox", { name: "Title" }).fill(title);
  await page.getByRole("button", { name: "Save" }).click();
  const checkbox = page.getByRole("checkbox", { name: `Mark "${title}" done` });
  await expect(checkbox).toBeVisible();
  // 2. Mark it done
  await checkbox.click();
  // 3. Assert its displayed state is done
  await expect(checkbox).toBeChecked();
});

// spec: tests/validation/test-plan.md § AC-001-b
import { test, expect } from "@playwright/test";
import { signIn } from "../lib/auth";

test("AC-001-b: after signing in, the user lands on their own to-do list", async ({ page }) => {
  // 1. Sign in via the Thunder gate
  await signIn(page);
  // 2. Assert the app landed on the to-do list
  await expect(page).toHaveURL(/\/todos$/);
  await expect(page.getByRole("heading", { name: "My To-Dos" })).toBeVisible();
});

// spec: tests/validation/test-plan.md § AC-001-a
import { test, expect } from "@playwright/test";

test("AC-001-a: an unauthenticated visitor is directed to sign in", async ({ page }) => {
  // 1. Navigate to the app root with no session
  await page.goto("/");
  // 2. The app checks its session, then redirects to the Thunder sign-in gate
  await expect(page.getByRole("textbox", { name: "Username" })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole("textbox", { name: "Password" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
});

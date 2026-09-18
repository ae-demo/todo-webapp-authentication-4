import { type Page, expect } from "@playwright/test";

export function credentials(): { username: string; password: string } {
  const username = process.env.AEP_E2E_USERNAME;
  const password = process.env.AEP_E2E_PASSWORD;
  if (!username || !password) {
    throw new Error(
      "AEP_E2E_USERNAME / AEP_E2E_PASSWORD are not set — export the test-user login from the roles gate ticket before running this spec",
    );
  }
  return { username, password };
}

// Navigates to the app root and drives the Thunder sign-in gate. The app
// redirects an unauthenticated visitor there itself (AC-001-a). If the
// sign-in form is already showing (e.g. logout() just landed on it), skip
// the extra navigation — re-navigating to "/" re-runs the app's session
// check, which is occasionally slow (observed live, tens of seconds) and
// only wastes time here since we already know there's no session.
export async function signIn(page: Page): Promise<void> {
  const { username, password } = credentials();
  const usernameBox = page.getByRole("textbox", { name: "Username" });
  if (!(await usernameBox.isVisible().catch(() => false))) {
    await page.goto("/");
  }
  await expect(usernameBox).toBeVisible({ timeout: 30_000 });
  await usernameBox.fill(username);
  await page.getByRole("textbox", { name: "Password" }).fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page.getByRole("heading", { name: "My To-Dos" })).toBeVisible();
}

// The deployed IdP's post_logout_redirect_uri is currently rejected (400 on
// the IdP's own /oauth2/logout page), so the app never completes its own
// redirect back to "/". The local + IdP session is dropped regardless
// (confirmed live: a subsequent visit to "/" requires a fresh sign-in), so
// this drives the same effect a working redirect would: end the session,
// then land back at the app to reach the sign-in gate.
export async function logout(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Account" }).click();
  await page.getByRole("menuitem", { name: "Log out" }).click();
  // The click's own navigation to the IdP's /oauth2/logout is still
  // in-flight here; wait for it to land before forcing our own way back
  // to "/" below, or this goto races it and aborts with ERR_ABORTED.
  await page.waitForURL(/\/oauth2\/logout/, { timeout: 15_000 });
  await page.goto("/");
  await expect(page.getByRole("textbox", { name: "Username" })).toBeVisible({ timeout: 30_000 });
}

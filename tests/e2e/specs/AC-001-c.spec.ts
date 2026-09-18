// spec: tests/validation/test-plan.md § AC-001-c
import { test } from "@playwright/test";

// specs/design/security.json provisions exactly one test account
// (test-user, role User); the roles gate ticket (#3) published only that
// one login. Verifying "one user's session never shows another user's
// entries" needs two distinct signed-in identities, which this
// environment does not provide — there is no second account to sign in
// as, and no self-registration path on the Thunder gate (confirmed live).
// Skipping honestly reports `not_run` rather than fabricating a pass with
// a single identity, or a fail that isn't the app's fault. See
// tests/validation/test-plan.md § AC-001-c.
test.skip(
  "AC-001-c: one user's signed-in session never shows another user's entries",
  () => {},
);

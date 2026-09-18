# Validation test plan — todo-webapp-authentication-4

Target: `todo-webapp` (primary), backed by `todo-api`. Auth: Thunder gate,
one provisioned role `User`, one test account `test-user`
(`specs/design/security.json`).

Explored live with playwright-cli against the deployed environment on
2026-09-18 before authoring specs (sign-in gate, `/todos` list, add/edit/
delete dialogs, account menu, logout).

**Observed live defect (not a criterion on its own, but affects how
sign-out is driven):** the app's logout calls the IdP's
`/oauth2/logout?...&post_logout_redirect_uri=<app origin>` and the IdP
rejects it with `400 invalid post_logout_redirect_uri`, so the user is
stranded on an IdP error page instead of being bounced back to the app.
The session is still dropped server-side (confirmed: a fresh visit to `/`
after this immediately requires signing in again), so specs that need to
"sign out and back in" drive it as: click Log out, then navigate to `/`
directly rather than relying on the broken redirect. See `lib/auth.ts`.
This is flagged in the report as an application defect.

## AC-001-a — An unauthenticated visitor is directed to sign in before reaching the to-do list

- Target: todo-webapp (primary)
- Steps:
  1. With no session, navigate to `/`
  2. Wait for the app's session check to resolve
- Assert: the Thunder sign-in form (Username/Password/Sign In) becomes visible
- Source of truth: live playwright-cli exploration (root redirects through
  a "Checking your session…" state to `development-idp.../gate/signin`)

## AC-001-b — After signing in, the user lands on their own to-do list

- Target: todo-webapp (primary)
- Steps:
  1. Navigate to `/`, sign in with the test-user credentials
- Assert: the URL is `/todos` and the "My To-Dos" heading is visible
- Source of truth: live exploration

## AC-001-c — One user's signed-in session never shows another user's entries

- **Not automated this run.** `specs/design/security.json` provisions
  exactly one test account (`test-user`, role `User`); the roles gate
  ticket (#3) published only that one login. Cross-user isolation needs
  two distinct signed-in identities, which the environment does not have.
  Spec is authored and `test.skip()`s with this reason, so it reports
  `not_run` honestly rather than a fabricated pass. This is a provisioning
  gap to flag, not an application defect.

## AC-002-a — Submitting a title creates a new entry visible in the user's list

- Target: todo-webapp
- Steps:
  1. Sign in
  2. Click "Add entry", fill Title with a unique run-stamped value, click Save
- Assert: a row with that title is visible in the list
- Source of truth: live exploration (`/todos/new` form)

## AC-002-b — A newly created entry starts as not-done

- Target: todo-webapp
- Steps: same as AC-002-a
- Assert: the entry's "Mark ... done" checkbox is unchecked
- Source of truth: live exploration

## AC-003-a — The list view shows every entry the user has created

- Target: todo-webapp
- Steps:
  1. Sign in
  2. Create two uniquely-titled entries
- Assert: both titles are visible in the list at once
- Source of truth: live exploration

## AC-003-b — The list persists and reappears unchanged after sign out/in

- Target: todo-webapp
- Steps:
  1. Sign in, create a uniquely-titled entry
  2. Log out (see defect note above), sign back in
- Assert: the entry is still visible with the same title
- Source of truth: live exploration

## AC-004-a — Marking an entry done updates its displayed state to done

- Target: todo-webapp
- Steps:
  1. Sign in, create an entry
  2. Click its "Mark ... done" checkbox
- Assert: the checkbox is checked
- Source of truth: live exploration

## AC-004-b — Marking a done entry not-done reverts its displayed state

- Target: todo-webapp
- Steps:
  1. Sign in, create an entry, mark it done
  2. Click the checkbox again
- Assert: the checkbox is unchecked
- Source of truth: live exploration

## AC-005-a — Editing an entry's title and saving updates the title shown

- Target: todo-webapp
- Steps:
  1. Sign in, create an entry with title A
  2. Click Edit, replace the title with unique title B, click Save
- Assert: title B is visible in the list; title A is not
- Source of truth: live exploration (`/todos/{id}/edit` form)

## AC-006-a — Deleting an entry removes it from the user's list

- Target: todo-webapp
- Steps:
  1. Sign in, create an entry
  2. Click Delete, confirm in the "Delete entry" dialog
- Assert: the entry's title is no longer visible in the list
- Source of truth: live exploration (confirm dialog with Cancel/Delete)

## AC-006-b — A deleted entry does not reappear after signing out and back in

- Target: todo-webapp
- Steps:
  1. Sign in, create an entry, delete + confirm it
  2. Log out (see defect note above), sign back in
- Assert: the entry's title is not visible
- Source of truth: live exploration

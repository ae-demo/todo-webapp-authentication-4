# Validation report

- **Issue:** #7
- **Commit:** 86488aa73e40612eab9d7c03b27631cb7f5a3a9a
- **Generated:** 2026-09-18T07:04:15.002Z
- **Playwright:** 1.61.1

## Summary

| Method | Total | Pass | Fail | Not run |
|---|---|---|---|---|
| e2e | 12 | 11 | 0 | 1 |
| manual (human checklist) | 0 | — | — | — |
| scenario (not validated) | 0 | — | — | — |

## E2E results

| Criterion | Must | Status | Spec | Notes |
|---|---|---|---|---|
| AC-001-a | An unauthenticated visitor is directed to sign in before reaching the to-do list | ✅ pass | `tests/e2e/specs/AC-001-a.spec.ts` | — |
| AC-001-b | After signing in, the user lands on their own to-do list | ✅ pass | `tests/e2e/specs/AC-001-b.spec.ts` | — |
| AC-001-c | One user's signed-in session never shows another user's entries | ⏭️ not_run | `tests/e2e/specs/AC-001-c.spec.ts` | — |
| AC-002-a | Submitting a title creates a new entry visible in the user's list | ✅ pass | `tests/e2e/specs/AC-002-a.spec.ts` | — |
| AC-002-b | A newly created entry starts as not-done | ✅ pass | `tests/e2e/specs/AC-002-b.spec.ts` | — |
| AC-003-a | The list view shows every entry the user has created | ✅ pass | `tests/e2e/specs/AC-003-a.spec.ts` | — |
| AC-003-b | The list persists and reappears unchanged after the user signs out and signs back in | ✅ pass | `tests/e2e/specs/AC-003-b.spec.ts` | — |
| AC-004-a | Marking an entry done updates its displayed state to done | ✅ pass | `tests/e2e/specs/AC-004-a.spec.ts` | — |
| AC-004-b | Marking a done entry not-done reverts its displayed state | ✅ pass | `tests/e2e/specs/AC-004-b.spec.ts` | — |
| AC-005-a | Editing an entry's title and saving updates the title shown in the list | ✅ pass | `tests/e2e/specs/AC-005-a.spec.ts` | — |
| AC-006-a | Deleting an entry removes it from the user's list | ✅ pass | `tests/e2e/specs/AC-006-a.spec.ts` | — |
| AC-006-b | A deleted entry does not reappear after signing out and back in | ✅ pass | `tests/e2e/specs/AC-006-b.spec.ts` | — |


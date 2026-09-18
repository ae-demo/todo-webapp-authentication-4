// THIS IS THE ONLY FILE THAT KNOWS ABOUT SCREENS (thunder-authentication).
// Adapted from assets/screens.example.ts for todo-webapp's three screens
// (wireframes.dsl), in rail order.
//
// The contract has no single-entry GET (only GET /me/todo-entries, POST, PATCH
// and DELETE under /me/todo-entries/{entryId}) — EditEntry receives the entry
// it edits from TodoList's already-loaded row (router state), so it has no
// load call of its own: `loads: null`. Its Save button is separately gated
// with <Can op="PATCH /me/todo-entries/{entryId}"> and AddEntry's Save with
// <Can op="POST /me/todo-entries">, so the buttons and the API calls they
// trigger can never disagree with the token.
//
// This project's security.json has exactly one role, "User", holding every
// todo-entries:* handle, and every flow requires it (no `public` screen here).

import { canCall } from "./core";
import { OPERATIONS, isOperationKey, type OperationKey } from "./operations.gen";

export interface ScreenRoute {
  readonly key: string;
  readonly label: string;
  readonly path: string;
  readonly loads: OperationKey | null;
  readonly public?: boolean;
}

export const SCREEN_ROUTES: readonly ScreenRoute[] = [
  { key: "todolist", label: "My To-Dos", path: "/todos", loads: "GET /me/todo-entries" },
  { key: "addentry", label: "Add Entry", path: "/todos/new", loads: null },
  { key: "editentry", label: "Edit Entry", path: "/todos/:entryId/edit", loads: null },
];

for (const screen of SCREEN_ROUTES) {
  if (screen.loads !== null && !isOperationKey(screen.loads)) {
    throw new Error(
      `src/authz/screens.ts: screen "${screen.label}" loads "${screen.loads}", which ` +
        `no contract declares. Re-run \`npm run gen\`, or name the operation the ` +
        `way openapi.yaml spells it.`,
    );
  }
}

export function reachableScreens(
  scopes: ReadonlySet<string>,
  signedIn: boolean,
): readonly ScreenRoute[] {
  return SCREEN_ROUTES.filter((screen) => {
    if (screen.public) return true;
    if (screen.loads === null) return signedIn;
    return canCall(OPERATIONS[screen.loads], scopes, signedIn);
  });
}

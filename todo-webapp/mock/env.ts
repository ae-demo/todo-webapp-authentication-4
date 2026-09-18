// mockEnv carries exactly the keys the platform actually emits for this
// component (react-webapp Constraints table): this app's own USER_AUTH_*
// OIDC keys. No USER_AUTH_JWKS_URL (the browser never validates a token — the
// API gateway does — so src/env.ts does not declare it) and no sibling API
// URL (same-origin /api, never a browser key).
//
// Scopes: the OIDC ones (`openid profile email group ou`, singular) plus this
// project's own catalog handles from specs/design/security.json, exactly as
// the platform would request them.
export const mockEnv = {
  USER_AUTH_CLIENT_ID: "mock-client",
  USER_AUTH_ISSUER: "https://mock-idp.test",
  USER_AUTH_SCOPES:
    "openid profile email group ou todo-entries:read todo-entries:create todo-entries:update todo-entries:delete",
  USER_AUTH_RESOURCE: "https://mock-idp.test/resources/mock-project",
};

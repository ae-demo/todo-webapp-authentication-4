// Typed read of window._env_, the platform's runtime config. Populated by
// /env-config.js, which the platform mounts into the served root at request
// time — never at build time (react-webapp). Throws at module load if that
// file never ran, which is also what makes mock/plugin.ts's own /env-config.js
// stand-in exercise the same failure mode a misconfigured pod would.
//
// Only the four USER_AUTH_* keys the browser itself needs are declared here.
// USER_AUTH_JWKS_URL is emitted by the platform too, but the browser never
// validates a token — the API gateway does — so no asset reads it and it has
// no place in this type.
type Env = {
  USER_AUTH_CLIENT_ID: string;
  USER_AUTH_ISSUER: string;
  USER_AUTH_SCOPES: string;
  USER_AUTH_RESOURCE: string;
};

declare global {
  interface Window {
    _env_: Env;
  }
}

if (!window._env_) {
  throw new Error(
    "window._env_ not set — /env-config.js failed to load. " +
      "The platform mounts this file; if you see this locally, host " +
      "/env-config.js from your dev server.",
  );
}

export const env: Env = window._env_;

// The OIDC redirect target — thunder-authentication: computed as
// `<origin>/callback`, routed OUTSIDE the AuthzProvider (there is no session
// to read until the redirect has been processed). Calls handleCallback() once
// on mount, then returns to the app root.
import { useEffect, useRef, type JSX } from "react";
import { Box, Typography } from "@wso2/oxygen-ui";
import { handleCallback } from "../authz/session";

export function CallbackPage(): JSX.Element {
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void handleCallback()
      .catch((err) => {
        console.error("authz: sign-in callback failed", err);
      })
      .finally(() => {
        window.location.assign("/");
      });
  }, []);

  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <Typography variant="body1" color="text.secondary">
        Signing you in…
      </Typography>
    </Box>
  );
}

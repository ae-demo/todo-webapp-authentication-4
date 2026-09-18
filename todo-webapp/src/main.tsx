import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { OxygenUIThemeProvider, OxygenTheme } from "@wso2/oxygen-ui";
import { App } from "./App";

// Dev-only, dynamic-import-guarded (react-webapp mock-mode.md). `DEV`/`MODE`
// are literals Vite substitutes at build time, so this whole branch — and the
// msw chunk it imports — is proven dead and dropped from a production build.
async function enableMocking(): Promise<void> {
  if (!import.meta.env.DEV || import.meta.env.MODE !== "mock") return;
  const { startMockWorker } = await import("../mock/browser");
  await startMockWorker();
}

void enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <OxygenUIThemeProvider theme={OxygenTheme}>
        <App />
      </OxygenUIThemeProvider>
    </StrictMode>,
  );
});

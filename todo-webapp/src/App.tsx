// Adapted from thunder-authentication's assets/App.example.tsx. The ROUTING
// STRUCTURE is prescribed there (NoAccess above the shell, Forbidden inside
// it, /callback outside the provider, every gated route wrapped in
// RequireOperation) — only PAGE_BY_KEY and APP_NAME are this app's own.
//
// This project has exactly one role (User, every todo-entries:* handle) and
// no public screen, so PUBLIC_SCREENS is always empty here — but the
// structure stays so a design change (a second role, a public screen) is a
// data change in src/authz/screens.ts, not a rewrite of this file.
import { useEffect, type ReactElement } from "react";
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import {
  AuthzProvider,
  Forbidden,
  NoAccess,
  RequireOperation,
  useAuthz,
  useScopes,
} from "./authz/gates";
import { SCREEN_ROUTES, reachableScreens } from "./authz/screens";
import { setForbiddenNavigator } from "./authz/client";
import { signIn } from "./authz/session";
import { APP_NAME } from "./appName";
import { AppShell } from "./shell/AppShell";
import { CallbackPage } from "./pages/Callback";
import { TodoListPage } from "./pages/TodoList";
import { AddEntryPage } from "./pages/AddEntry";
import { EditEntryPage } from "./pages/EditEntry";

const PAGE_BY_KEY: Record<string, ReactElement> = {
  todolist: <TodoListPage />,
  addentry: <AddEntryPage />,
  editentry: <EditEntryPage />,
};

const PUBLIC_SCREENS = SCREEN_ROUTES.filter((screen) => screen.public);

export function App(): ReactElement {
  return (
    <BrowserRouter>
      <ForbiddenWiring />
      <Routes>
        <Route path="/callback" element={<CallbackPage />} />
        {PUBLIC_SCREENS.map((screen) => (
          <Route
            key={screen.key}
            path={screen.path}
            element={
              <AuthzProvider fallback={<Splash />}>{PAGE_BY_KEY[screen.key]}</AuthzProvider>
            }
          />
        ))}
        <Route
          path="*"
          element={
            <AuthzProvider fallback={<Splash />}>
              <SignedIn />
            </AuthzProvider>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

function ForbiddenWiring(): null {
  const navigate = useNavigate();
  useEffect(() => {
    setForbiddenNavigator(() => navigate("/forbidden", { replace: true }));
  }, [navigate]);
  return null;
}

function Splash(): ReactElement {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <p>Checking your session…</p>
    </div>
  );
}

function SignedIn(): ReactElement {
  const { signedIn } = useAuthz();
  const scopes = useScopes();

  // Load-time guard only: a MISSING session signs in. currentUser() already
  // tried a silent renew, so a merely-expired token never lands here — only
  // signIn() on that would turn a refresh into a full-screen redirect.
  useEffect(() => {
    if (!signedIn) void signIn();
  }, [signedIn]);

  if (!signedIn) return <Splash />;

  const reachable = reachableScreens(scopes, signedIn);

  // NoAccess REPLACES the shell — no rail around "you have no access".
  if (reachable.length === 0) return <NoAccess appName={APP_NAME} />;

  const landing = reachable[0].path;

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to={landing} replace />} />
        {SCREEN_ROUTES.map((screen) => {
          if (screen.public) return null;
          const page = PAGE_BY_KEY[screen.key];
          if (screen.loads === null) {
            return <Route key={screen.key} path={screen.path} element={page} />;
          }
          return (
            <Route
              key={screen.key}
              element={<RequireOperation op={screen.loads} screen={screen.label} />}
            >
              <Route path={screen.path} element={page} />
            </Route>
          );
        })}
        {/* Forbidden is INSIDE the shell: the rail the caller can use stays. */}
        <Route path="/forbidden" element={<Forbidden />} />
        <Route path="*" element={<Navigate to={landing} replace />} />
      </Route>
    </Routes>
  );
}

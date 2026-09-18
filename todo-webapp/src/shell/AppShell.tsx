// The app chrome, per oxygen-ui-design-system's sample AppLayout. Every gated
// screen renders inside it (react-webapp). wireframes.dsl draws only
// `navbar "Todo"` for this app — one section (My To-Dos) reached by a form
// flow, so the sidebar carries that one link rather than being dropped: the
// shell structure (header + sidebar + main + footer) is prescribed regardless
// of how many links the rail holds.
import type { JSX } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  AppShell as OxygenAppShell,
  Header,
  Sidebar,
  Footer,
  UserMenu,
  ColorSchemeToggle,
  Divider,
} from "@wso2/oxygen-ui";
import { ListTodo, LogOut } from "@wso2/oxygen-ui-icons-react";
import { APP_NAME } from "../appName";
import { useAuthz } from "../authz/gates";
import { signOut } from "../authz/session";

export function AppShell(): JSX.Element {
  const { pathname } = useLocation();
  const { username } = useAuthz();
  const active = pathname.startsWith("/todos") ? "todolist" : "";

  return (
    <OxygenAppShell>
      <OxygenAppShell.Navbar>
        <Header>
          <Header.Toggle />
          <Header.Brand>
            <Header.BrandTitle>{APP_NAME}</Header.BrandTitle>
          </Header.Brand>
          <Header.Spacer />
          <Header.Actions>
            <ColorSchemeToggle />
            <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
            <UserMenu>
              <UserMenu.Trigger name={username || "Signed in"} />
              <UserMenu.Header name={username || "Signed in"} email="" />
              <UserMenu.Logout
                icon={<LogOut size={18} />}
                onClick={() => {
                  void signOut();
                }}
              />
            </UserMenu>
          </Header.Actions>
        </Header>
      </OxygenAppShell.Navbar>

      <OxygenAppShell.Sidebar>
        <Sidebar activeItem={active}>
          <Sidebar.Nav>
            <Sidebar.Category>
              <Sidebar.Item id="todolist" link={<Link to="/todos" />}>
                <Sidebar.ItemIcon>
                  <ListTodo size={18} />
                </Sidebar.ItemIcon>
                <Sidebar.ItemLabel>My To-Dos</Sidebar.ItemLabel>
              </Sidebar.Item>
            </Sidebar.Category>
          </Sidebar.Nav>
        </Sidebar>
      </OxygenAppShell.Sidebar>

      <OxygenAppShell.Main>
        <Outlet />
      </OxygenAppShell.Main>

      <OxygenAppShell.Footer>
        <Footer>
          <Footer.Copyright>© WSO2 LLC</Footer.Copyright>
        </Footer>
      </OxygenAppShell.Footer>
    </OxygenAppShell>
  );
}

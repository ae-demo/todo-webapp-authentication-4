// wireframes.dsl `screen EditEntry`: navbar, card "Edit Entry" with a Title
// input, a Done checkbox (active), and a Cancel/Save row. No load call of its
// own (screens.ts: loads: null): the contract has no single-entry GET, only
// GET /me/todo-entries (list), POST, PATCH and DELETE — so this screen takes
// the entry TodoList already loaded via router state, falling back to one
// list call (filtered to this id) when opened directly (a reload, a typed
// URL). Save calls updateTodoEntry.
import { useEffect, useState, type FormEvent, type JSX } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  PageContent,
  PageTitle,
  Stack,
  TextField,
} from "@wso2/oxygen-ui";
import { todoApi } from "../api";
import { ApiError, ForbiddenError } from "../authz/client";
import { Can } from "../authz/gates";
import type { components } from "../generated/todo-api";

type TodoEntry = components["schemas"]["TodoEntry"];

export function EditEntryPage(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const { entryId } = useParams<{ entryId: string }>();
  const stateEntry = (location.state as { entry?: TodoEntry } | null)?.entry;

  const [entry, setEntry] = useState<TodoEntry | null>(stateEntry ?? null);
  const [notFound, setNotFound] = useState(false);
  const [title, setTitle] = useState(stateEntry?.title ?? "");
  const [done, setDone] = useState(stateEntry?.done ?? false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (entry || !entryId) return;
    // Opened directly (no router state carried) — recover the entry from the
    // one list operation the contract offers, rather than inventing a
    // single-entry fetch the API does not have.
    void (async () => {
      try {
        const { data, error: apiError } = await todoApi.GET("/me/todo-entries", {
          params: { query: { limit: 100, offset: 0 } },
        });
        if (apiError) throw new Error("Could not load your to-do entries.");
        const found = data?.data.find((e) => e.id === entryId) ?? null;
        if (!found) {
          setNotFound(true);
          return;
        }
        setEntry(found);
        setTitle(found.title);
        setDone(found.done);
      } catch (err) {
        setError(messageFor(err, "Could not load that entry."));
      }
    })();
  }, [entry, entryId]);

  async function handleSave(event: FormEvent): Promise<void> {
    event.preventDefault();
    if (!entryId) return;
    const trimmed = title.trim();
    if (!trimmed) {
      setError("Title is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const { error: apiError } = await todoApi.PATCH("/me/todo-entries/{entryId}", {
        params: { path: { entryId } },
        body: { title: trimmed, done },
      });
      if (apiError) throw new Error(apiError.message || "Could not save that entry.");
      navigate("/todos");
    } catch (err) {
      setError(messageFor(err, "Could not save that entry."));
    } finally {
      setSaving(false);
    }
  }

  if (notFound) {
    return (
      <PageContent maxWidth={640}>
        <PageTitle>
          <PageTitle.Header>Edit an existing to-do entry</PageTitle.Header>
        </PageTitle>
        <Alert severity="error">
          That entry no longer exists. <Button onClick={() => navigate("/todos")}>Back to My To-Dos</Button>
        </Alert>
      </PageContent>
    );
  }

  if (!entry) {
    return (
      <PageContent maxWidth={640}>
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress size={24} />
        </Box>
      </PageContent>
    );
  }

  return (
    <PageContent maxWidth={640}>
      <PageTitle>
        <PageTitle.Header>Edit an existing to-do entry</PageTitle.Header>
      </PageTitle>

      <Card component="form" onSubmit={handleSave}>
        <CardHeader title="Edit Entry" />
        <CardContent>
          <Stack spacing={3}>
            {error ? <Alert severity="error">{error}</Alert> : null}
            <TextField
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              fullWidth
            />
            <FormControlLabel
              control={<Checkbox checked={done} onChange={(e) => setDone(e.target.checked)} />}
              label="Done"
            />
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <Button variant="outlined" onClick={() => navigate("/todos")} disabled={saving}>
                Cancel
              </Button>
              <Can
                op="PATCH /me/todo-entries/{entryId}"
                fallback={
                  <Alert severity="warning">You do not have permission to edit entries.</Alert>
                }
              >
                <Button type="submit" variant="contained" disabled={saving}>
                  Save
                </Button>
              </Can>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </PageContent>
  );
}

function messageFor(err: unknown, fallback: string): string {
  if (err instanceof ForbiddenError) return err.message;
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message || fallback;
  return fallback;
}

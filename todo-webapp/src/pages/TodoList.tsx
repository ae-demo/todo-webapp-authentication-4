// wireframes.dsl `screen TodoList`: navbar, a heading + "Add entry" primary
// button row, and a "Done | Title | Actions" table. Loads GET
// /me/todo-entries — the operation src/authz/screens.ts gates this screen on.
import { useCallback, useEffect, useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  ListingTable,
  PageContent,
  PageTitle,
} from "@wso2/oxygen-ui";
import { Pencil, Plus, Trash2 } from "@wso2/oxygen-ui-icons-react";
import { Can } from "../authz/gates";
import { todoApi } from "../api";
import { ApiError, ForbiddenError } from "../authz/client";
import type { components } from "../generated/todo-api";

type TodoEntry = components["schemas"]["TodoEntry"];

export function TodoListPage(): JSX.Element {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<TodoEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TodoEntry | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const { data, error: apiError } = await todoApi.GET("/me/todo-entries", {
        params: { query: { limit: 100, offset: 0 } },
      });
      if (apiError) throw new Error("Could not load your to-do entries.");
      setEntries(data?.data ?? []);
    } catch (err) {
      setEntries([]);
      setError(messageFor(err, "Could not load your to-do entries."));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function toggleDone(entry: TodoEntry): Promise<void> {
    setPendingId(entry.id);
    setError(null);
    try {
      const { data, error: apiError } = await todoApi.PATCH("/me/todo-entries/{entryId}", {
        params: { path: { entryId: entry.id } },
        body: { done: !entry.done },
      });
      if (apiError || !data) throw new Error("Could not update that entry.");
      setEntries((prev) => (prev ?? []).map((e) => (e.id === entry.id ? data : e)));
    } catch (err) {
      setError(messageFor(err, "Could not update that entry."));
    } finally {
      setPendingId(null);
    }
  }

  async function confirmDelete(): Promise<void> {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    setPendingId(target.id);
    setError(null);
    try {
      const { error: apiError, response } = await todoApi.DELETE("/me/todo-entries/{entryId}", {
        params: { path: { entryId: target.id } },
      });
      if (apiError && response.status !== 204) throw new Error("Could not delete that entry.");
      setEntries((prev) => (prev ?? []).filter((e) => e.id !== target.id));
    } catch (err) {
      setError(messageFor(err, "Could not delete that entry."));
    } finally {
      setPendingId(null);
    }
  }

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>My To-Dos</PageTitle.Header>
        <PageTitle.Actions>
          <Can op="POST /me/todo-entries">
            <Button
              variant="contained"
              startIcon={<Plus size={18} />}
              onClick={() => navigate("/todos/new")}
            >
              Add entry
            </Button>
          </Can>
        </PageTitle.Actions>
      </PageTitle>

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      <ListingTable.Container>
        <ListingTable>
          <ListingTable.Head>
            <ListingTable.Row>
              <ListingTable.Cell>Done</ListingTable.Cell>
              <ListingTable.Cell>Title</ListingTable.Cell>
              <ListingTable.Cell align="right">Actions</ListingTable.Cell>
            </ListingTable.Row>
          </ListingTable.Head>
          <ListingTable.Body>
            {entries === null ? (
              <ListingTable.Row>
                <ListingTable.Cell colSpan={3}>
                  <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                    <CircularProgress size={24} />
                  </Box>
                </ListingTable.Cell>
              </ListingTable.Row>
            ) : entries.length === 0 ? (
              <ListingTable.Row>
                <ListingTable.Cell colSpan={3}>
                  <ListingTable.EmptyState
                    title="No to-do entries yet"
                    description="Add your first entry to get started."
                  />
                </ListingTable.Cell>
              </ListingTable.Row>
            ) : (
              entries.map((entry) => (
                <ListingTable.Row key={entry.id}>
                  <ListingTable.Cell>
                    <Can op="PATCH /me/todo-entries/{entryId}" fallback={<Checkbox checked={entry.done} disabled />}>
                      <Checkbox
                        checked={entry.done}
                        disabled={pendingId === entry.id}
                        onChange={() => {
                          void toggleDone(entry);
                        }}
                        inputProps={{ "aria-label": `Mark "${entry.title}" done` }}
                      />
                    </Can>
                  </ListingTable.Cell>
                  <ListingTable.Cell
                    sx={entry.done ? { textDecoration: "line-through", color: "text.secondary" } : undefined}
                  >
                    {entry.title}
                  </ListingTable.Cell>
                  <ListingTable.Cell align="right">
                    <ListingTable.RowActions>
                      <Can op="PATCH /me/todo-entries/{entryId}">
                        <IconButton
                          size="small"
                          aria-label={`Edit "${entry.title}"`}
                          onClick={() => navigate(`/todos/${entry.id}/edit`, { state: { entry } })}
                        >
                          <Pencil size={18} />
                        </IconButton>
                      </Can>
                      <Can op="DELETE /me/todo-entries/{entryId}">
                        <IconButton
                          size="small"
                          aria-label={`Delete "${entry.title}"`}
                          disabled={pendingId === entry.id}
                          onClick={() => setDeleteTarget(entry)}
                        >
                          <Trash2 size={18} />
                        </IconButton>
                      </Can>
                    </ListingTable.RowActions>
                  </ListingTable.Cell>
                </ListingTable.Row>
              ))
            )}
          </ListingTable.Body>
        </ListingTable>
      </ListingTable.Container>

      <Dialog open={deleteTarget !== null} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete entry</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Delete "{deleteTarget?.title}"? This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              void confirmDelete();
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </PageContent>
  );
}

function messageFor(err: unknown, fallback: string): string {
  if (err instanceof ForbiddenError) return err.message;
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message || fallback;
  return fallback;
}

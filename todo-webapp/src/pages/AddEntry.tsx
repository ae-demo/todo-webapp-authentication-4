// wireframes.dsl `screen AddEntry`: navbar, card "New Entry" with a Title
// input and a Cancel/Save row. No load call (screens.ts: loads: null); Save
// posts createTodoEntry.
import { useState, type FormEvent, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  PageContent,
  PageTitle,
  Stack,
  TextField,
} from "@wso2/oxygen-ui";
import { todoApi } from "../api";
import { ApiError, ForbiddenError } from "../authz/client";
import { Can } from "../authz/gates";

export function AddEntryPage(): JSX.Element {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave(event: FormEvent): Promise<void> {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError("Title is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const { error: apiError } = await todoApi.POST("/me/todo-entries", {
        body: { title: trimmed },
      });
      if (apiError) throw new Error(apiError.message || "Could not add that entry.");
      navigate("/todos");
    } catch (err) {
      setError(messageFor(err, "Could not add that entry."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageContent maxWidth={640}>
      <PageTitle>
        <PageTitle.Header>Add a new to-do entry</PageTitle.Header>
      </PageTitle>

      <Card component="form" onSubmit={handleSave}>
        <CardHeader title="New Entry" />
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
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <Button variant="outlined" onClick={() => navigate("/todos")} disabled={saving}>
                Cancel
              </Button>
              <Can
                op="POST /me/todo-entries"
                fallback={
                  <Alert severity="warning">You do not have permission to add entries.</Alert>
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

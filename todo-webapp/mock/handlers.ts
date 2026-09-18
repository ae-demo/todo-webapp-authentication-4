// One handler per todo-api operation (specs/design/components/todo-api/openapi.yaml),
// exported as `handlers`. mock/authz/gateway.ts has already refused any caller
// who lacks the operation's scope by the time a request reaches here, so
// nothing below re-checks a handle — only each path's own reach: every
// operation here is under /me/, so a handler answers the mock caller's rows
// and nothing else, a row that exists but is owned by somebody else is a 404
// (never 403), and state lives in this module's own scope so a create shows
// up in the next list, a delete removes it and an edit persists — until the
// next full page load re-seeds it (react-webapp mock-mode.md).
import { http, HttpResponse } from "msw";
import type { components } from "../src/generated/todo-api";

type TodoEntry = components["schemas"]["TodoEntry"];
type TodoEntryCreate = components["schemas"]["TodoEntryCreate"];
type TodoEntryUpdate = components["schemas"]["TodoEntryUpdate"];

/** The caller every mock request speaks for. Seed one row owned by somebody
 *  else below, or "my entries" and "every entry" would look identical. */
export const mockCaller = {
  userId: "01a0ab00-0000-7000-8000-000000000001",
  username: "mock-owner",
};

interface StoredEntry extends TodoEntry {
  owner: string;
}

let nextId = 4;
let entries: StoredEntry[] = [
  {
    id: "1",
    title: "Buy groceries",
    done: false,
    createdAt: "2026-09-15T09:00:00.000Z",
    updatedAt: "2026-09-15T09:00:00.000Z",
    owner: mockCaller.userId,
  },
  {
    id: "2",
    title: "Finish report",
    done: true,
    createdAt: "2026-09-14T09:00:00.000Z",
    updatedAt: "2026-09-16T10:00:00.000Z",
    owner: mockCaller.userId,
  },
  {
    id: "3",
    title: "Call dentist",
    done: false,
    createdAt: "2026-09-16T09:00:00.000Z",
    updatedAt: "2026-09-16T09:00:00.000Z",
    owner: mockCaller.userId,
  },
  // Not the mock caller's — proves /me/todo-entries filters by owner rather
  // than returning every row.
  {
    id: "4",
    title: "Someone else's reminder",
    done: false,
    createdAt: "2026-09-10T09:00:00.000Z",
    updatedAt: "2026-09-10T09:00:00.000Z",
    owner: "not-the-caller",
  },
];

function toApi(entry: StoredEntry): TodoEntry {
  const { owner: _owner, ...rest } = entry;
  return rest;
}

function errorBody(code: number, message: string) {
  return { code, message };
}

export const handlers = [
  http.get("/api/me/todo-entries", ({ request }) => {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") ?? 20);
    const offset = Number(url.searchParams.get("offset") ?? 0);
    const mine = entries.filter((e) => e.owner === mockCaller.userId);
    const page = mine.slice(offset, offset + limit);
    return HttpResponse.json({
      count: mine.length,
      next: offset + limit < mine.length ? `/me/todo-entries?limit=${limit}&offset=${offset + limit}` : null,
      previous: offset > 0 ? `/me/todo-entries?limit=${limit}&offset=${Math.max(0, offset - limit)}` : null,
      data: page.map(toApi),
    });
  }),

  http.post("/api/me/todo-entries", async ({ request }) => {
    const body = (await request.json()) as TodoEntryCreate;
    if (!body?.title || !body.title.trim()) {
      return HttpResponse.json(errorBody(400, "title is required"), { status: 400 });
    }
    const now = new Date().toISOString();
    const created: StoredEntry = {
      id: String(nextId++),
      title: body.title,
      done: false,
      createdAt: now,
      updatedAt: now,
      owner: mockCaller.userId,
    };
    entries = [...entries, created];
    return HttpResponse.json(toApi(created), { status: 201 });
  }),

  http.patch("/api/me/todo-entries/:entryId", async ({ params, request }) => {
    const body = (await request.json()) as TodoEntryUpdate;
    const index = entries.findIndex(
      (e) => e.id === params.entryId && e.owner === mockCaller.userId,
    );
    if (index === -1) {
      return HttpResponse.json(errorBody(404, "no such entry for this caller"), { status: 404 });
    }
    const current = entries[index];
    const updated: StoredEntry = {
      ...current,
      title: body.title !== undefined ? body.title : current.title,
      done: body.done !== undefined ? body.done : current.done,
      updatedAt: new Date().toISOString(),
    };
    entries = [...entries.slice(0, index), updated, ...entries.slice(index + 1)];
    return HttpResponse.json(toApi(updated));
  }),

  http.delete("/api/me/todo-entries/:entryId", ({ params }) => {
    const index = entries.findIndex(
      (e) => e.id === params.entryId && e.owner === mockCaller.userId,
    );
    if (index === -1) {
      return HttpResponse.json(errorBody(404, "no such entry for this caller"), { status: 404 });
    }
    entries = [...entries.slice(0, index), ...entries.slice(index + 1)];
    return new HttpResponse(null, { status: 204 });
  }),
];

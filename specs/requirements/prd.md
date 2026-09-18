# todo-webapp-authentication-4 — PRD

## Problem Statement

People who track personal tasks in scattered places — sticky notes, chat messages to themselves, or apps with no real accounts — lose track of what they meant to do and can't trust their list to be there, unchanged, the next time they open it. They need a simple place to keep their own to-do entries that stays private to them and persists reliably.

## Solution

A web application where each person signs in with their own identity and keeps a personal list of to-do entries. Entries a user creates are saved to a database, so their list is private, durable, and available whenever they sign back in.

## Actors

- **User** — a signed-in individual who creates, views, updates, completes, and deletes their own to-do entries. Cannot see or affect any other user's entries.

## User Stories

1. As a User, I want to sign in with my own identity, so that my to-do list is private to me.
2. As a User, I want to add a new to-do entry with a title, so that I can capture something I need to do.
3. As a User, I want to see the list of all my to-do entries, so that I can review what I still need to do.
4. As a User, I want to mark an entry as done or not-done, so that I can track my progress.
5. As a User, I want to edit the title of an existing entry, so that I can fix or refine what it says.
6. As a User, I want to delete an entry, so that I can remove things I no longer need to track.

## Product Decisions

- **Sign-in**: every user authenticates via SSO through Thunder, the platform identity provider (organization default).
- **Data model per entry**: a title and a done/not-done state only — no due dates, priority, or categories.
- **Scope of visibility**: personal only — each user's entries are private to that user; there is no sharing or collaboration between users.
- **Persistence**: entries are stored in a database so they survive across sessions and devices.
- **Editing and deletion are supported** *assumed* — a usable personal to-do list needs to let a user correct a title and remove an entry, not just add and complete ones.
- **No external third-party services** are required beyond the platform's own sign-in — the product has no payments, email, or other integrations to make it work *assumed*.

## Out of Scope

- Sharing, assigning, or collaborating on entries with other users.
- Due dates, reminders, priorities, categories, or tags on entries.
- Notifications of any kind (email, push, etc.).
- Mobile native apps — this is a web application only.

## Open Questions

*(none — all decisions needed to write this PRD have been settled or assumed above)*


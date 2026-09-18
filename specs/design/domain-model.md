# Domain Model

Each signed-in user owns a private set of to-do entries; nothing else is modeled.

```mermaid
erDiagram
    USER {
        string id
        string email
    }
    TODO_ENTRY {
        string id
        string userId
        string title
        boolean done
        datetime createdAt
        datetime updatedAt
    }
    USER ||--o{ TODO_ENTRY : owns
```

`USER` is the signed-in identity from Thunder (its `id` is the token subject) — no local user table is stored beyond that reference. `TODO_ENTRY.userId` scopes every entry to its owner.
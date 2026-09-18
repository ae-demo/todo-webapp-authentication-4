// Persistence for a caller's to-do entries. Every function here takes the
// caller's userId (resolved from the gateway assertion, never from the
// client) and scopes its query to it — the two-filter rule from
// api-management: a bare `WHERE id = ?` is never enough on its own.
import ballerina/sql;
import ballerina/time;
import ballerina/uuid;
import ballerinax/postgresql;
import ballerinax/postgresql.driver as _;

# One row of `todo_entries`, as persisted.
#
# + id - entry id
# + userId - the owning caller's assertion `sub`
# + title - entry title
# + done - completion state
# + createdAt - creation timestamp
# + updatedAt - last-modified timestamp
type TodoEntryDbRow record {|
    string id;
    string userId;
    string title;
    boolean done;
    time:Utc createdAt;
    time:Utc updatedAt;
|};

final sql:ParameterizedQuery CREATE_TABLE_QUERY = `
    CREATE TABLE IF NOT EXISTS todo_entries (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        done BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL
    )`;

final sql:ParameterizedQuery CREATE_INDEX_QUERY = `
    CREATE INDEX IF NOT EXISTS todo_entries_user_id_idx ON todo_entries (user_id)`;

// Constructed lazily, on the first call that actually needs the database —
// never at module init — so this service starts cleanly with no todo-db
// credentials configured and only fails the DB call itself at runtime.
postgresql:Client? dbClientHolder = ();

function getDbClient() returns postgresql:Client|error {
    postgresql:Client? existing = ();
    lock {
        existing = dbClientHolder;
    }
    if existing is postgresql:Client {
        return existing;
    }
    postgresql:Client|sql:Error created = new (
        host = dbHost,
        username = dbUser,
        password = dbPassword,
        database = dbName,
        port = dbPort
    );
    if created is sql:Error {
        return created;
    }
    sql:ExecutionResult|sql:Error tableResult = created->execute(CREATE_TABLE_QUERY);
    if tableResult is sql:Error {
        return tableResult;
    }
    sql:ExecutionResult|sql:Error indexResult = created->execute(CREATE_INDEX_QUERY);
    if indexResult is sql:Error {
        return indexResult;
    }
    lock {
        dbClientHolder = created;
    }
    return created;
}

# Total number of the caller's entries, for the pagination envelope.
#
# + userId - the caller's assertion `sub`
# + return - the row count, or an error
function countTodoEntries(string userId) returns int|error {
    postgresql:Client dbClient = check getDbClient();
    sql:ParameterizedQuery query = `SELECT COUNT(*) AS total FROM todo_entries WHERE user_id = ${userId}`;
    record {| int total; |} result = check dbClient->queryRow(query);
    return result.total;
}

# A page of the caller's entries, newest first.
#
# + userId - the caller's assertion `sub`
# + pageLimit - max rows to return
# + pageOffset - rows to skip
# + return - the page of rows, or an error
function listTodoEntries(string userId, int pageLimit, int pageOffset) returns TodoEntryDbRow[]|error {
    postgresql:Client dbClient = check getDbClient();
    sql:ParameterizedQuery query = `
        SELECT id, user_id AS "userId", title, done, created_at AS "createdAt", updated_at AS "updatedAt"
        FROM todo_entries
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
        LIMIT ${pageLimit} OFFSET ${pageOffset}`;
    stream<TodoEntryDbRow, sql:Error?> resultStream = dbClient->query(query);
    TodoEntryDbRow[] rows = [];
    check from TodoEntryDbRow row in resultStream
        do {
            rows.push(row);
        };
    return rows;
}

# Inserts a new entry owned by the caller. New entries always start `done = false`.
#
# + userId - the caller's assertion `sub`, stamped as the owner
# + title - the entry title, already validated non-empty by the caller
# + return - the created row, or an error
function insertTodoEntry(string userId, string title) returns TodoEntryDbRow|error {
    postgresql:Client dbClient = check getDbClient();
    string id = uuid:createType4AsString();
    time:Utc now = time:utcNow();
    sql:ParameterizedQuery query = `
        INSERT INTO todo_entries (id, user_id, title, done, created_at, updated_at)
        VALUES (${id}, ${userId}, ${title}, false, ${new sql:TimestampValue(now)}, ${new sql:TimestampValue(now)})`;
    _ = check dbClient->execute(query);
    return {id, userId, title, done: false, createdAt: now, updatedAt: now};
}

# One entry, scoped to its owner. Not found — including a real id owned by
# someone else — is `()`, never an error: the handler turns that into 404.
#
# + entryId - the entry id
# + userId - the caller's assertion `sub`
# + return - the row, `()` when there is no such row for this caller, or an error
function findTodoEntry(string entryId, string userId) returns TodoEntryDbRow?|error {
    postgresql:Client dbClient = check getDbClient();
    sql:ParameterizedQuery query = `
        SELECT id, user_id AS "userId", title, done, created_at AS "createdAt", updated_at AS "updatedAt"
        FROM todo_entries
        WHERE id = ${entryId} AND user_id = ${userId}`;
    TodoEntryDbRow|sql:Error result = dbClient->queryRow(query);
    if result is sql:NoRowsError {
        return ();
    }
    if result is sql:Error {
        return result;
    }
    return result;
}

# Applies a partial update (title and/or done) to the caller's own entry.
#
# + entryId - the entry id
# + userId - the caller's assertion `sub`
# + newTitle - the new title, or `()` to leave it unchanged
# + newDone - the new completion state, or `()` to leave it unchanged
# + return - the updated row, `()` when there is no such row for this caller, or an error
function updateTodoEntry(string entryId, string userId, string? newTitle, boolean? newDone)
        returns TodoEntryDbRow?|error {
    postgresql:Client dbClient = check getDbClient();
    time:Utc now = time:utcNow();
    sql:ParameterizedQuery query = `
        UPDATE todo_entries
        SET title = COALESCE(${newTitle}, title),
            done = COALESCE(${newDone}, done),
            updated_at = ${new sql:TimestampValue(now)}
        WHERE id = ${entryId} AND user_id = ${userId}`;
    sql:ExecutionResult result = check dbClient->execute(query);
    int? affectedRowCount = result.affectedRowCount;
    if affectedRowCount is () || affectedRowCount == 0 {
        return ();
    }
    return findTodoEntry(entryId, userId);
}

# Deletes the caller's own entry.
#
# + entryId - the entry id
# + userId - the caller's assertion `sub`
# + return - true when a row was deleted, false when there was no such row for this caller, or an error
function deleteTodoEntry(string entryId, string userId) returns boolean|error {
    postgresql:Client dbClient = check getDbClient();
    sql:ParameterizedQuery query = `DELETE FROM todo_entries WHERE id = ${entryId} AND user_id = ${userId}`;
    sql:ExecutionResult result = check dbClient->execute(query);
    int? affectedRowCount = result.affectedRowCount;
    return affectedRowCount is int && affectedRowCount > 0;
}

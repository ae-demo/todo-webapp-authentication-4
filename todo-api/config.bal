// All external configuration, read once, in one place. Every value has a
// sensible default so this service starts with no environment variables set
// at all — the todo-db credentials only matter the first time a request
// actually touches the database (see db.bal's lazy client).
import ballerina/os;

isolated function envOrDefault(string name, string default) returns string {
    string value = os:getEnv(name);
    return value == "" ? default : value;
}

isolated function envIntOrDefault(string name, int default) returns int {
    string value = os:getEnv(name);
    if value == "" {
        return default;
    }
    int|error parsed = int:fromString(value);
    return parsed is int ? parsed : default;
}

configurable string dbHost = envOrDefault("TODO_DB_HOST", "localhost");
configurable int dbPort = envIntOrDefault("TODO_DB_PORT", 5432);
configurable string dbName = envOrDefault("TODO_DB_DBNAME", "todo");
configurable string dbUser = envOrDefault("TODO_DB_USER", "postgres");
configurable string dbPassword = envOrDefault("TODO_DB_PASSWORD", "");

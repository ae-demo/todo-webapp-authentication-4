// Verifies the gateway-assertion trust boundary in gateway_assertion.bal,
// against a throwaway RSA keypair minted for this test run only — nothing
// here talks to a real gateway or IdP.
//
// GATEWAY_ASSERTION_CERTIFICATE/_ISSUER/_HEADER must be exported (from
// tests/resources/correct_cert.pem) before `bal test` runs, because the
// interceptor reads them once at listener startup, before any test function
// executes. See tests/README for the exact command.
//
// ALL operations on this API require a scope, so there is no security:[]
// resource to exercise the "public resource needs no assertion" case — the
// component's Scope enforcement is entirely the gateway's, and none of this
// service's operations skip it.
//
// Business-logic outcomes (list/create/... success) depend on todo-db being
// reachable, which this test environment does not guarantee. So these tests
// assert only the auth outcome: a 401 means the assertion was rejected before
// reaching the handler; anything else means it was accepted and forwarded.
import ballerina/http;
import ballerina/jwt;
import ballerina/test;

const string TEST_ISSUER = "test-gateway";
const string TEST_HEADER = "x-jwt-assertion";
const string CORRECT_KEY_FILE = "tests/resources/correct_private.pem";
const string WRONG_KEY_FILE = "tests/resources/wrong_private.pem";

final http:Client todoApiTestClient = check new ("http://localhost:9090");

function mintAssertion(string keyFilePath, string subject) returns string|error {
    jwt:IssuerConfig issuerConfig = {
        issuer: TEST_ISSUER,
        username: subject,
        expTime: 300,
        signatureConfig: {
            config: {keyFile: keyFilePath}
        }
    };
    return jwt:issue(issuerConfig);
}

// Corrupts the payload segment of a `header.payload.signature` JWT while
// leaving the header and signature untouched, so the signature can no longer
// verify against the (now different) payload it was computed over.
function tamperPayload(string token) returns string {
    string[] segments = re `\.`.split(token);
    string payload = segments[1];
    string corruptedPayload = payload.length() > 0 ? ("X" + payload.substring(1)) : "X";
    return segments[0] + "." + corruptedPayload + "." + segments[2];
}

@test:Config {}
function testValidAssertionIsAccepted() returns error? {
    string token = check mintAssertion(CORRECT_KEY_FILE, "user-1");
    http:Response response = check todoApiTestClient->get("/me/todo-entries", {[TEST_HEADER]: token});
    test:assertNotEquals(response.statusCode, 401, msg = "a validly signed assertion must not be rejected");
}

@test:Config {}
function testWrongKeySignatureIsRejected() returns error? {
    string token = check mintAssertion(WRONG_KEY_FILE, "user-1");
    http:Response response = check todoApiTestClient->get("/me/todo-entries", {[TEST_HEADER]: token});
    test:assertEquals(response.statusCode, 401, msg = "an assertion signed by a different key must be rejected");
}

@test:Config {}
function testTamperedPayloadIsRejected() returns error? {
    string token = check mintAssertion(CORRECT_KEY_FILE, "user-1");
    string tampered = tamperPayload(token);
    http:Response response = check todoApiTestClient->get("/me/todo-entries", {[TEST_HEADER]: tampered});
    test:assertEquals(response.statusCode, 401, msg = "a tampered payload must be rejected, never treated as anonymous");
}

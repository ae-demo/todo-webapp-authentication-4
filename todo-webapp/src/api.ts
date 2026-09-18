// The todo-api client: openapi-fetch typed against the generated contract,
// same-origin `/api` (nginx proxies it to the sibling — react-webapp). This
// module adds NOTHING of its own about authorization: the bearer and the 401
// rule both come from src/authz/client.ts, exactly as thunder-authentication
// prescribes.
import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "./generated/todo-api";
import { authorizationHeader, classifyResponse, ForbiddenError } from "./authz/client";

const authMiddleware: Middleware = {
  async onRequest({ request }) {
    const header = await authorizationHeader();
    if (header) request.headers.set("Authorization", header);
    return request;
  },
  async onResponse({ response }) {
    if ((await classifyResponse(response.status)) === "forbidden") {
      throw new ForbiddenError(response.status);
    }
    return response;
  },
};

export const todoApi = createClient<paths>({ baseUrl: "/api" });
todoApi.use(authMiddleware);

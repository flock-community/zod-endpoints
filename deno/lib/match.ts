import * as z from "./index.ts";

export type MatchRequest = Pick<
  z.output<z.HttpRequestObject>,
  "method" | "path" | "query" | "headers" | "body"
>;
export type MatchResponse = Pick<
  z.output<z.HttpResponseObject>,
  "status" | "headers" | "body"
>;

const requestPicker = {
  method: true,
  path: true,
  query: true,
  headers: true,
  body: true,
} as const;
const responsePicker = { status: true, headers: true, body: true } as const;

export function matchRequest(
  schema: z.HttpUnion,
  req: MatchRequest
): z.HttpObject | undefined {
  function check(request: z.HttpRequestObject) {
    try {
      request.pick(requestPicker).parse(req);
      return true;
    } catch (e) {
      return false;
    }
  }

  return schema.options.find(check);
}

export function matchResponse(
  responses: z.HttpResponseUnion,
  req: MatchResponse
): z.HttpResponseObject | undefined {
  function check(response: z.HttpResponseObject) {
    try {
      response.pick(responsePicker).parse(req);
      return true;
    } catch (e) {
      return false;
    }
  }
  if ("shape" in responses) {
    return responses;
  }
  if ("options" in responses) {
    return responses.options.find(check);
  }
  return undefined;
}

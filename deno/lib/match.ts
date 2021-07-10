import * as z from "./deps.ts";
import {
  HttpObject,
  HttpRequestObject,
  HttpResponseObject,
  HttpResponseUnion,
  HttpUnion,
} from "./model.ts";

export type MatchRequest = Pick<
  z.output<HttpRequestObject>,
  "method" | "path" | "query" | "headers" | "body"
>;
export type MatchResponse = Pick<
  z.output<HttpResponseObject>,
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
  schema: HttpUnion,
  req: MatchRequest
): HttpObject | undefined {
  function check(request: HttpRequestObject) {
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
  responses: HttpResponseUnion,
  req: MatchResponse
): HttpResponseObject | undefined {
  function check(response: HttpResponseObject) {
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

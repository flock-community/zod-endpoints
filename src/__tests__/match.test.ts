// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import * as z from "../index";

test("match requset", () => {
  const a = z.endpoint({
    name: "A",
    method: "GET",
    path: [z.literal("a")],
    query: {
      next: z.parameter(z.string()),
    },
    responses: [
      z.response({
        status: 200,
      }),
    ],
  });

  const b = z.endpoint({
    name: "B",
    method: "POST",
    path: [z.literal("b")],
    query: {
      next: z.parameter(z.string().optional()),
    },
    responses: [
      z.response({
        status: 200,
        body: [
          z.body({
            type: "application/json",
            content: z.object({
              b: z.string(),
            }),
          }),
          z.body({
            type: "plain/text",
            content: z.object({
              c: z.string(),
            }),
          }),
        ],
      }),
    ],
  });
  const schema = z.union([a, b]);

  const reqA: z.MatchRequest = {
    method: "GET",
    path: ["a"],
    query: {
      next: "a",
    },
    headers: {},
  };

  const reqB: z.MatchRequest = {
    method: "POST",
    path: ["b"],
    query: {
      next: undefined,
    },
    headers: {},
  };

  expect(z.matchRequest(schema, reqA)).toEqual(a);
  expect(z.matchRequest(schema, reqB)).toEqual(b);
});

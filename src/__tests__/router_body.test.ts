// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import * as z from "../index";
import { openApi } from "../openapi";

test("router with body", async () => {
  const pet = z.reference(
    "Pets",
    z.object({
      id: z.integer("int64"),
      name: z.string(),
      tag: z.string().optional(),
    })
  );

  const schema = z.endpoints([
    z.endpoint({
      name: "C",
      method: "POST",
      path: [z.literal("pets")],
      body: z.body({
        type: "application/json",
        content: pet,
      }),
      responses: [
        z.response({
          status: 201,
          headers: {},
          description: "Post with body",
        }),
      ],
    }),
  ]);

  const api: z.Api<typeof schema> = {
    C: () =>
      Promise.resolve({
        status: 201,
        headers: {},
      }),
  };

  const res = await api["C"]({
    method: "POST",
    path: ["pets"],
    query: {},
    headers: {},
    body: { type: "application/json", content: { id: 1, name: "Joe" } },
  });
  expect(res).toEqual({
    status: 201,
    headers: {},
  });

  const open = openApi(schema);
  expect(open).toEqual({
    components: undefined,
    info: {
      title: "No title",
      version: "1.0.0",
    },
    openapi: "3.0.0",
    paths: {
      "/pets": {
        post: {
          operationId: "C",
          parameters: undefined,
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Pets",
                },
              },
            },
          },
          responses: {
            201: {
              content: undefined,
              description: "Post with body",
              headers: undefined,
            },
          },
          summary: undefined,
          tags: undefined,
        },
      },
    },
    servers: [],
  });
});

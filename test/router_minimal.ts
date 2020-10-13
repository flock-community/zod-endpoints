import * as z from "../mod.ts";
import { Api, openApi } from "../mod.ts";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

Deno.test("minimal router one route", async () => {
  const schema = z.router([
    z.route({
      name: "A",
      method: "GET",
      responses: [
        z.response({
          status: 200,
          type: "application/json",
        }),
      ],
    }),
  ]);

  const api: Api<typeof schema> = {
    "A": () => Promise.resolve({ status: 200 }),
  };

  const res = await api["A"]({ method: "GET", path: [""] });
  assertEquals(res, { status: 200 });
});

Deno.test("minimal router two routes", async () => {
  const schema = z.router([
    z.route({
      name: "B",
      method: "POST",
      responses: [
        z.response({
          status: 200,
          type: "application/json",
          content: z.object({
            b: z.string(),
          }),
        }),
        z.response({
          status: 200,
          type: "plain/text",
          content: z.object({
            c: z.string(),
          }),
        }),
      ],
    }),
  ]);

  const api: Api<typeof schema> = {
    "B": () => Promise.resolve({ status: 200, content: { b: "b" } }),
  };

  const res = await api["B"]({ method: "POST", path: [""] });
  assertEquals(res, { status: 200, content: { b: "b" } });

  const open = openApi(schema);
  assertEquals(open, {
    components: undefined,
    info: {
      title: "No title",
      version: "1.0.0",
    },
    openapi: "3.0.0",
    paths: {
      "/": {
        post: {
          operationId: "B",
          parameters: undefined,
          requestBody: undefined,
          responses: {
            200: {
              content: {
                "application/json": {
                  schema: {
                    properties: {
                      b: {
                        type: "string",
                      },
                    },
                    required: [
                      "b",
                    ],
                    type: "object",
                  },
                },
                "plain/text": {
                  schema: {
                    properties: {
                      c: {
                        type: "string",
                      },
                    },
                    required: [
                      "c",
                    ],
                    type: "object",
                  },
                },
              },
              description: undefined,
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

import * as z from "../mod.ts";
import { Api, body, openApi } from "../mod.ts";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

Deno.test("router with body", async () => {
  const pet = z.reference(
    "Pets",
    z.object({
      id: z.integer("int64"),
      name: z.string(),
      tag: z.string().optional(),
    }),
  );

  const schema = z.router([
    z.route({
      name: "C",
      method: "POST",
      path: [z.literal("pets")],
      body: body({
        type: "application/json",
        content: pet,
      }),
      responses: [
        z.response({
          status: 201,
          description: "Post with body",
        }),
      ],
    }),
  ]);

  const api: Api<typeof schema> = {
    "C": () => Promise.resolve({ status: 201 }),
  };

  const res = await api["C"](
    {
      method: "POST",
      path: ["pets"],
      body: { type: "application/json", content: { id: 1, name: "Joe" } },
    },
  );
  assertEquals(res, { status: 201 });

  const open = openApi(schema);
  assertEquals(open, {
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

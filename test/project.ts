import {
  literal,
  object,
  string,
  tuple,
  union,
} from "../../zod/src/index.ts";

const routerSchema = union([
  object({
    name: literal("GET_USER"),
    path: tuple([literal("user")]),
    method: literal("GET"),
    headers: object({
      accept: union([
        literal("text/html"),
        literal("application/json"),
      ]),
    }),
    responses: union([
      object({
        status: literal(200),
        headers: object({
          "content-type": union(
            [literal("application/json"), literal("text/html")],
          ),
        }),
        body: object({
          uuid: string().uuid(),
          name: string(),
        }),
      }),
      object({
        status: literal(404),
      }),
    ])
      .optional(),
  }),
  object({
    name: literal("POST_USER"),
    path: tuple([literal("user"), string().uuid()]),
    method: literal("POST"),
    headers: object({
      accept: literal("application/json"),
      "content-type": literal("application/json"),
      body: object({
        uuid: string().uuid(),
        name: string(),
      }),
    }),
    responses: union([
      object({
        status: literal(200),
        headers: object({
          "content-type": literal("application/json"),
        }),
        body: object({
          uuid: string().uuid(),
          name: string(),
        }),
      }),
      object({
        status: literal(404),
      }),
    ])
      .optional(),
  }),
]);

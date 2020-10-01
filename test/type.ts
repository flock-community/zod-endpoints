import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

import * as z from "../deps.ts";
import { createSchema } from "../openapi.ts";
import { integer } from "../lib/index.ts";

Deno.test("type string", () => {
  const zod = z.string();
  assertEquals(createSchema(zod), {
    type: "string",
  });
});

Deno.test("type object", () => {
  const zod = z.object({
    id: z.number(),
    name: z.string(),
    tag: z.string().optional(),
  });
  assertEquals(createSchema(zod), {
    type: "object",
    required: ["id", "name"],
    properties: {
      id: {
        type: "integer",
        format: "int32",
      },
      name: {
        type: "string",
      },
      tag: {
        type: "string",
      },
    },
  });
});

Deno.test("type nested object", () => {
  const zod = z.object({
    id: z.number(),
    name: z.string(),
    obj: z.object({
      test: z.string(),
    }).optional(),
  });
  assertEquals(createSchema(zod), {
    type: "object",
    required: ["id", "name"],
    properties: {
      id: {
        type: "integer",
        format: "int32",
      },
      name: {
        type: "string",
      },
      obj: {
        properties: {
          test: {
            type: "string",
          },
        },
        required: ["test"],
        type: "object",
      },
    },
  });
});

Deno.test("type array", () => {
  const zod = z.array(z.string());
  assertEquals(createSchema(zod), {
    "type": "array",
    "items": {
      "type": "string",
    },
  });
});

Deno.test("type integer", () => {
  const int32 = integer();
  assertEquals(createSchema(int32), {
    format: "int32",
    type: "integer",
  });

  const int64 = integer("int64").max(100);
  assertEquals(createSchema(int64), {
    format: "int64",
    type: "integer",
  });
});

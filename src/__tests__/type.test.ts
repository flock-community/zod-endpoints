import * as z from "../index";

test("type string", () => {
  const zod = z.string();
  expect(z.createSchema(zod)).toEqual({
    type: "string"
  });
});

test("type object", () => {
  const zod = z.object({
    id: z.number(),
    name: z.string(),
    tag: z.string().optional()
  });
  expect(z.createSchema(zod)).toEqual({
    type: "object",
    required: ["id", "name"],
    properties: {
      id: {
        type: "integer",
        format: "int32"
      },
      name: {
        type: "string"
      },
      tag: {
        type: "string"
      }
    }
  });
});

test("type nested object", () => {
  const zod = z.object({
    id: z.number(),
    name: z.string(),
    obj: z
      .object({
        test: z.string()
      })
      .optional()
  });
  expect(z.createSchema(zod)).toEqual({
    type: "object",
    required: ["id", "name"],
    properties: {
      id: {
        type: "integer",
        format: "int32"
      },
      name: {
        type: "string"
      },
      obj: {
        properties: {
          test: {
            type: "string"
          }
        },
        required: ["test"],
        type: "object"
      }
    }
  });
});

test("type array", () => {
  const zod = z.array(z.string());
  expect(z.createSchema(zod)).toEqual({
    type: "array",
    items: {
      type: "string"
    }
  });
});

test("type integer", () => {
  const int32 = z.integer();
  expect(z.createSchema(int32)).toEqual({
    format: "int32",
    type: "integer"
  });

  const int64 = z.integer("int64").max(100);
  expect(z.createSchema(int64)).toEqual({
    format: "int64",
    type: "integer"
  });
});

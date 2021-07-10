// @ts-ignore TS6133
import { expect } from "https://deno.land/x/expect@v0.2.6/mod.ts";
const test = Deno.test;

import petApi from "../data/petstore.ts";
import * as z from "../index.ts";
import { openApi } from "../openapi.ts";

const Error = z.object({
  code: z.integer(),
  message: z.string(),
});

const Pet = z.object({
  id: z.integer("int64"),
  name: z.string(),
  tag: z.string().optional(),
});

const Pets = z.array(z.reference("Pet", Pet));

const schema = z.endpoints([
  z.endpoint({
    name: "listPets",
    summary: "List all pets",
    tags: [z.literal("pets")],
    method: "GET",
    path: [z.literal("pets")],
    query: {
      limit: z
        .parameter(z.integer("int32").max(100).optional())
        .description("How many items to return at one time (max 100)"),
    },
    responses: [
      z.response({
        status: 200,
        description: "A paged array of pets",
        headers: {
          "x-next": z
            .parameter(z.string())
            .name("x-next")
            .description("A link to the next page of responses"),
        },
        body: z.body({
          type: "application/json",
          content: z.reference("Pets", Pets),
        }),
      }),
      z.response({
        status: "default",
        description: "unexpected error",
        body: z.body({
          type: "application/json",
          content: z.reference("Error", Error),
        }),
      }),
    ],
  }),

  z.endpoint({
    name: "showPetById",
    summary: "Info for a specific pet",
    tags: [z.literal("pets")],
    method: "GET",
    path: [
      z.literal("pets"),
      z
        .parameter(z.string().uuid())
        .name("petId")
        .description("The id of the pet to retrieve"),
    ],
    responses: [
      z.response({
        status: 200,
        description: "Expected response to a valid request",
        body: z.body({
          type: "application/json",
          content: z.reference("Pet", Pet),
        }),
      }),
      z.response({
        status: "default",
        description: "unexpected error",
        body: z.body({
          type: "application/json",
          content: z.reference("Error", Error),
        }),
      }),
    ],
  }),

  z.endpoint({
    name: "createPets",
    summary: "Create a pet",
    tags: [z.literal("pets")],
    method: "POST",
    path: [z.literal("pets")],
    headers: {
      accept: z.parameter(z.literal("application/json")),
    },
    responses: [
      z.response({
        status: 201,
        description: "Null response",
      }),
      z.response({
        status: "default",
        description: "unexpected error",
        body: z.body({
          type: "application/json",
          content: z.reference("Error", Error),
        }),
      }),
    ],
  }),
]);

const server = { url: "http://petstore.swagger.io/v1" };
const api = openApi(
  schema,
  { version: "1.0.0", title: "Swagger Petstore", license: { name: "MIT" } },
  [server]
);

test("compare open api schema", () => {
  function compare(actual: unknown, expected: unknown) {
    const value = JSON.parse(JSON.stringify(actual));
    expect(value).toEqual(expected);
  }

  compare(api.paths["/pets"].get, petApi.paths["/pets"].get);
  compare(api.paths["/pets/{petId}"].get, petApi.paths["/pets/{petId}"].get);
  compare(api.paths["/pets"].post, petApi.paths["/pets"].post);
  compare(api.components?.schemas?.Error, petApi.components?.schemas?.Error);
  compare(api.components?.schemas?.Pet, petApi.components?.schemas?.Pet);
  compare(api.components?.schemas?.Pets, petApi.components?.schemas?.Pets);
  compare(api, petApi);
});

test("validate example request", () => {
  type Input = z.input<typeof schema>;

  const listPets: Input = {
    path: ["pets"],
    method: "GET",
    query: {
      limit: 10,
    },
    headers: {},
    responses: {
      description: "A paged array of pets",
      status: 200,
      headers: {
        "x-next": "?",
      },
      body: {
        type: "application/json",
        content: [
          {
            id: 1,
            name: "Bello",
            tag: "DOG",
          },
        ],
      },
    },
  };
  expect(schema.parse(listPets).name).toEqual("listPets");

  const showPetById: Input = {
    path: ["pets", "b945f0a8-022d-11eb-adc1-0242ac120002"],
    method: "GET",
    query: {},
    headers: {},
    responses: {
      description: "unexpected error",
      status: "default",
      headers: undefined,
      body: {
        type: "application/json",
        content: {
          code: 50,
          message: "This is an error",
        },
      },
    },
  };
  const res = schema.parse(showPetById);
  expect(res.name).toEqual("showPetById");
});

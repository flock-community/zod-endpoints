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

const schema = z.union([
  z.object({
    name: z.literal("listPets").default("listPets"),
    summary: z.literal("List all pets").default("List all pets"),
    tags: z.tuple([z.literal("pets")]).default(["pets"]),
    path: z.tuple([z.literal("pets")]),
    method: z.literal("GET"),
    query: z.object({
      limit: z
        .parameter(z.integer("int32").max(100).optional())
        .description("How many items to return at one time (max 100)"),
    }),
    headers: z.object({}),
    body: z.undefined(),
    responses: z.union([
      z.object({
        status: z.literal(200),
        description: z.literal("A paged array of pets"),
        headers: z.object({
          "x-next": z
            .parameter(z.string())
            .name("x-next")
            .description("A link to the next page of responses"),
        }),
        body: z.object({
          type: z.literal("application/json"),
          content: z.reference("Pets", Pets),
        }),
      }),
      z.object({
        status: z.literal("default"),
        description: z.literal("unexpected error"),
        headers: z.object({}),
        body: z.object({
          type: z.literal("application/json"),
          content: z.reference("Error", Error),
        }),
      }),
    ]),
  }),
  z.object({
    name: z.literal("showPetById").default("showPetById"),
    summary: z
      .literal("Info for a specific pet")
      .default("Info for a specific pet"),
    tags: z.tuple([z.literal("pets")]).default(["pets"]),
    path: z.tuple([
      z.literal("pets"),
      z
        .parameter(z.string().uuid())
        .name("petId")
        .description("The id of the pet to retrieve"),
    ]),
    method: z.literal("GET"),
    query: z.object({}),
    headers: z.object({}),
    body: z.undefined(),
    responses: z.union([
      z.object({
        status: z.literal(200),
        description: z.literal("Expected response to a valid request"),
        headers: z.object({}),
        body: z.object({
          type: z.literal("application/json"),
          content: z.reference("Pet", Pet),
        }),
      }),
      z.object({
        status: z.literal("default"),
        description: z.literal("unexpected error"),
        headers: z.object({}),
        body: z.object({
          type: z.literal("application/json"),
          content: z.reference("Error", Error),
        }),
      }),
    ]),
  }),
  z.object({
    name: z.literal("createPets").default("createPets"),
    summary: z.literal("Create a pet").default("Create a pet"),
    tags: z.tuple([z.literal("pets")]).default(["pets"]),
    path: z.tuple([z.literal("pets")]),
    method: z.literal("POST"),
    query: z.object({}),
    headers: z.object({
      accept: z.parameter(z.literal("application/json")),
    }),
    body: z.undefined(),
    responses: z.union([
      z.object({
        status: z.literal(201),
        description: z.literal("Null response"),
        headers: z.object({}),
        body: z.undefined(),
      }),
      z.object({
        status: z.literal("default"),
        description: z.literal("unexpected error"),
        headers: z.object({}),
        body: z.object({
          type: z.literal("application/json"),
          content: z.reference("Error", Error),
        }),
      }),
    ]),
  }),
]);

test("api interface", () => {
  const api: z.Api<typeof schema> = {
    listPets: () =>
      Promise.resolve({
        status: 200,
        headers: { "x-next": "abc" },
        body: { type: "application/json", content: [] },
      }),
    showPetById: () =>
      Promise.resolve({
        status: 200,
        headers: {},
        body: { type: "application/json", content: { id: 1, name: "Pet" } },
      }),
    createPets: () => Promise.resolve({ status: 201, headers: {} }),
  };

  expect(api).toBeTruthy();
});

test("client interface", async () => {
  // @ts-ignore
  const client: z.Client<typeof schema> = (req) => {
    const match = z.matchRequest(schema, req);
    return Promise.resolve({
      status: 200,
      headers: {
        "x-next": "xxx",
      },
      body: {
        type: "application/json",
        content: [
          {
            id: 123,
            name: match?.shape.name.parse(undefined) ?? "",
          },
        ],
      },
    } as const);
  };

  const res = await client({
    method: "GET",
    path: ["pets"],
    headers: {},
    query: {},
    body: undefined,
  });

  expect(res.body).toEqual({
    type: "application/json",
    content: [{ id: 123, name: "listPets" }],
  });
});

test("compare open api schema", async () => {
  const server = { url: "http://petstore.swagger.io/v1" };
  const api = openApi(
    schema,
    {
      version: "1.0.0",
      title: "Swagger Petstore",
      license: { name: "MIT" },
    },
    [server]
  );

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
      status: 200,
      description: "A paged array of pets",
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
      status: "default",
      description: "unexpected error",
      headers: {},
      body: {
        type: "application/json",
        content: {
          code: 50,
          message: "This is an error",
        },
      },
    },
  };
  expect(schema.parse(showPetById).name).toEqual("showPetById");
});

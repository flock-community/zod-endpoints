import * as z from "../mod.ts";
import { OpenAPIObject } from "../utils/openapi3/OpenApi.ts";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { openApi } from "../openapi.ts";
import * as yaml from "https://deno.land/std/encoding/yaml.ts";
import { parameter, reference, integer, Api } from "../lib/index.ts";

const petApi =
  "https://raw.githubusercontent.com/OAI/OpenAPI-Specification/3.0.3/examples/v3.0/petstore.yaml";

const Error = z.object({
  code: integer(),
  message: z.string(),
});

const Pet = z.object({
  id: integer("int64"),
  name: z.string(),
  tag: z.string().optional(),
});

const Pets = z.array(reference("Pet", Pet));

const schema = z.union([
  z.object({
    name: z.literal("listPets").default("listPets"),
    summary: z.literal("List all pets").default("List all pets"),
    tags: z.tuple([z.literal("pets")]).default(["pets"]),
    path: z.tuple([z.literal("pets")]),
    method: z.literal("GET"),
    query: z.object({
      limit: parameter(integer("int32").max(100))
        .description("How many items to return at one time (max 100)"),
    }),
    headers: z.object({}),
    type: z.undefined(),
    body: z.undefined(),
    responses: z.union([
      z.object({
        status: z.literal(200),
        description: z.literal("A paged array of pets"),
        headers: z.object({
          "x-next": parameter(z.string())
            .name("x-next")
            .description("A link to the next page of responses"),
        }),
        type: z.literal("application/json"),
        content: reference("Pets", Pets),
      }),
      z.object({
        status: z.literal("default"),
        description: z.literal("unexpected error"),
        headers: z.object({}),
        type: z.literal("application/json"),
        content: reference("Error", Error),
      }),
    ]),
  }),
  z.object({
    name: z.literal("showPetById").default("showPetById"),
    summary: z.literal("Info for a specific pet").default(
      "Info for a specific pet",
    ),
    tags: z.tuple([z.literal("pets")]).default(["pets"]),
    path: z.tuple([
      z.literal("pets"),
      parameter(z.string().uuid())
        .name("petId")
        .description("The id of the pet to retrieve"),
    ]),
    method: z.literal("GET"),
    query: z.object({}),
    headers: z.object({}),
    type: z.undefined(),
    body: z.undefined(),
    responses: z.union([
      z.object({
        status: z.literal(200),
        description: z.literal("Expected response to a valid request"),
        headers: z.object({}),
        type: z.literal("application/json"),
        content: reference("Pet", Pet),
      }),
      z.object({
        status: z.literal("default"),
        description: z.literal("unexpected error"),
        headers: z.object({}),
        type: z.literal("application/json"),
        content: reference("Error", Error),
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
    type: z.undefined(),
    body: z.undefined(),
    responses: z.union([
      z.object({
        status: z.literal(201),
        description: z.literal("Null response"),
        headers: z.object({}),
        type: z.undefined(),
        content: z.undefined(),
      }),
      z.object({
        status: z.literal("default"),
        description: z.literal("unexpected error"),
        headers: z.object({}),
        type: z.literal("application/json"),
        content: reference("Error", Error),
      }),
    ]),
  }),
]);

Deno.test("api interface", () => {
  const api: Api<typeof schema> = {
    "listPets": () =>
      Promise.resolve(
        { status: 200, headers: { "x-next": "abc" }, content: [] },
      ),
    "showPetById": () =>
      Promise.resolve(
        { status: 200, headers: {}, content: { id: 1, name: "Pet" } },
      ),
    "createPets": () =>
      Promise.resolve({ status: 201, headers: {}, content: undefined }),
  };
});

Deno.test("compare open api schema", async () => {
  const server = { url: "http://petstore.swagger.io/v1" };
  const api = openApi(
    schema,
    {
      "version": "1.0.0",
      "title": "Swagger Petstore",
      license: { name: "MIT" },
    },
    [server],
  );
  const res: OpenAPIObject = await fetch(petApi)
    .then((res) => res.text())
    .then((text) => yaml.parse(text) as OpenAPIObject);

  function compare(actual: unknown, expected: unknown) {
    const value = JSON.parse(JSON.stringify(actual));
    assertEquals(value, expected);
  }

  compare(api.paths["/pets"].get, res.paths["/pets"].get);
  compare(api.paths["/pets/{petId}"].get, res.paths["/pets/{petId}"].get);
  compare(api.paths["/pets"].post, res.paths["/pets"].post);
  compare(api.components?.schemas?.Error, res.components?.schemas?.Error);
  compare(api.components?.schemas?.Pet, res.components?.schemas?.Pet);
  compare(api.components?.schemas?.Pets, res.components?.schemas?.Pets);
  compare(api, res);
});

Deno.test("validate example request", () => {
  type Input = z.input<typeof schema>;
  type Output = z.output<typeof schema>;

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
      type: "application/json",
      content: [{
        id: 1,
        name: "Bello",
        tag: "DOG",
      }],
    },
  };
  assertEquals(schema.parse(listPets).name, "listPets");

  const showPetById: Input = {
    path: ["pets", "b945f0a8-022d-11eb-adc1-0242ac120002"],
    method: "GET",
    query: {},
    headers: {},
    responses: {
      status: "default",
      description: "unexpected error",
      headers: {},
      type: "application/json",
      content: {
        code: 50,
        message: "This is an error",
      },
    },
  };
  assertEquals(schema.parse(showPetById).name, "showPetById");
});

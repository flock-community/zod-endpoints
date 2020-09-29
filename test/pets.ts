import { OpenAPIObject } from "../utils/openapi3/OpenApi.ts";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { Http, HttpObject, HttpUnion, openApi } from "../openapi.ts";
import * as yaml from "https://deno.land/std/encoding/yaml.ts";
import { parameter, reference, integer } from "../lib/index.ts";

import {
  literal,
  number,
  bigint,
  object,
  string,
  tuple,
  TypeOf,
  undefined as undef,
  union,
    array
} from "../deps.ts";

import * as z from "../deps.ts";

const petApi =
  "https://raw.githubusercontent.com/OAI/OpenAPI-Specification/3.0.3/examples/v3.0/petstore.yaml";

const Error = object({
  code: integer(),
  message: string(),
});

const Pet = z.object({
  id: integer('int64'),
  name: string(),
  tag: string().optional(),
});

const Pets = array(reference("Pet", Pet))

const schema: HttpUnion = union([
  object({
    name: literal("listPets").default("listPets"),
    summary: literal("List all pets"),
    tags: tuple([literal("pets")]),
    path: tuple([literal("pets")]),
    method: literal("GET"),
    query: object({
      limit: parameter(integer("int32").max(100))
        .description("How many items to return at one time (max 100)"),
    }),
    headers: object({}),
    responses: union([
      object({
        status: literal(200),
        description: literal("A paged array of pets"),
        headers: object({
          "x-next": parameter(string())
            .name("x-next")
            .description("A link to the next page of responses"),
        }),
        content: reference("Pets", Pets),
      }),
      object({
        status: undef(),
        description: literal("unexpected error"),
        headers: object({}),
        content: reference("Error", Error),
      }),
    ]),
  }),
  object({
    name: literal("showPetById").default("showPetById"),
    summary: literal("Info for a specific pet"),
    tags: tuple([literal("pets")]),
    path: tuple([
      literal("pets"),
      parameter(string().uuid())
        .name("petId")
        .description("The id of the pet to retrieve"),
    ]),
    method: literal("GET"),
    query: object({}),
    headers: object({}),
    responses: union([
      object({
        status: literal(200),
        description: literal("Expected response to a valid request"),
        headers: object({}),
        content: reference("Pet", Pet),
      }),
      object({
        status: undef(),
        description: literal("unexpected error"),
        headers: object({}),
        content: reference("Error", Error),
      }),
    ]),
  }),
  object({
    name: literal("createPets").default("createPets"),
    summary: literal("Create a pet"),
    tags: tuple([literal("pets")]),
    path: tuple([literal("pets")]),
    method: literal("POST"),
    query: object({}),
    headers: object({
      accept: literal("application/json"),
    }),
    responses: union([
      object({
        status: literal(201),
        description: literal("Null response"),
        headers: object({}),
        content: undef(),
      }),
      object({
        status: undef(),
        description: literal("unexpected error"),
        headers: object({}),
        content: reference("Error", Error),
      }),
    ]),
  }),
]);

const server = { url: "http://petstore.swagger.io/v1" };
const api = openApi(schema, [server]);
const res: OpenAPIObject = await fetch(petApi)
  .then((res) => res.text())
  .then((text) => yaml.parse(text) as OpenAPIObject);

Deno.test("compare open api schema", () => {
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
  type ReqRes = TypeOf<HttpObject>;

  const listPets:ReqRes = {
    path: ["pets"],
    method: "GET",
    query: {
      limit: 10,
    },
    headers: {},

    summary: "List all pets",
    tags: ["pets"],

    responses: {
      status: 200,
      description: "A paged array of pets",
      headers: {
        "x-next": "?",
      },
      content: [{
        id: 1,
        name: "Bello",
        tag: "DOG",
      }],
    },
  };
  assertEquals(schema.parse(listPets).name, "listPets");

  const showPetById:ReqRes = {
    summary: "Info for a specific pet",
    tags: ["pets"],
    path: ["pets", "b945f0a8-022d-11eb-adc1-0242ac120002"],
    method: "GET",
    query: {},
    headers: {},
    responses: {
      status: undefined,
      description: "unexpected error",
      headers: {},
      content: {
        code: 50,
        message: "This is an error",
      },
    },
  };
  assertEquals(schema.parse(showPetById).name, "showPetById");
});

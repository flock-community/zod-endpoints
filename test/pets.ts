import {OpenAPIObject} from "../utils/openapi3/OpenApi.ts";
import {assertEquals} from "https://deno.land/std/testing/asserts.ts";
import {HttpUnion, openApi} from "../openapi.ts";
import * as yaml from "https://deno.land/std/encoding/yaml.ts";
import {component, parameter} from "../lib/index.ts";
import {literal, number, object, string, tuple, TypeOf, undefined as undef, union} from "../../zod/src/index.ts";

const petApi =
    "https://raw.githubusercontent.com/OAI/OpenAPI-Specification/3.0.3/examples/v3.0/petstore.yaml";

const Pet = object({
    id: number(),
    name: string(),
    tag: string().optional()
})

const Error = object({
    id: number(),
    name: string(),
    tag: string()
})


const schema: HttpUnion = union([
    object({
        name: literal("listPets"),
        summary: literal("List all pets"),
        tags: tuple([literal("pets")]),
        path: tuple([literal("pets")]),
        method: literal("GET"),
        query: object({
            limit: parameter(number().max(100))
                .description("How many items to return at one time (max 100)"),
        }),
        headers: undef(),
        responses: union([
            object({
                status: literal(200),
                description: literal("A paged array of pets"),
                headers: object({
                    "x-next": parameter(string())
                        .name("x-next")
                        .description("A link to the next page of responses")
                }),
                content: component("Pets", Pet),
            }),
            object({
                status: undef(),
                description: literal("unexpected error"),
                headers: undef(),
                content: component("Error", Error),
            })
        ])
    }),
    object({
        name: literal("showPetById"),
        summary: literal("Info for a specific pet"),
        tags: tuple([literal("pets")]),
        path: tuple([
            literal("pets"),
            parameter(string().uuid())
                .name("petId")
                .description("The id of the pet to retrieve"),
        ]),
        method: literal("GET"),
        query: undef(),
        headers: undef(),
        responses: union([
            object({
                status: literal(200),
                description: literal("Expected response to a valid request"),
                headers: undef(),
                content: component("Pet", Pet),
            }),
            object({
                status: undef(),
                description: literal("unexpected error"),
                headers: undef(),
                content: component("Error", Error),
            })
        ])
    }),
    object({
        name: literal("createPets"),
        summary: literal("Create a pet"),
        tags: tuple([literal("pets")]),
        path: tuple([literal("pets")]),
        method: literal("POST"),
        query: undef(),
        headers: object({
            accept: literal("application/json"),
        }),
        responses: union([
            object({
                status: literal(201),
                description: literal("Null response"),
                headers: undef(),
                content: undef(),
            }),
            object({
                status: undef(),
                description: literal("unexpected error"),
                headers: undef(),
                content: component("Error", Error),
            })
        ])
    }),
]);

const server = {url: "http://petstore.swagger.io/v1"};
const api = openApi(schema, [server]);
const res: OpenAPIObject = await fetch(petApi)
    .then((res) => res.text())
    .then((text) => yaml.parse(text) as OpenAPIObject);

Deno.test("compare open api schema", () => {
    function compare(actual: unknown, expected: unknown) {
        const value = JSON.parse(JSON.stringify(actual))
        assertEquals(value, expected)
    }

    compare(api.paths["/pets"].get, res.paths["/pets"].get);
    compare(api.paths["/pets/{petId}"].get, res.paths["/pets/{petId}"].get);
    compare(api.paths["/pets"].post, res.paths["/pets"].post);
})

Deno.test("validate example request", () => {
    type ReqRes = TypeOf<typeof schema>

    const reqRes: ReqRes = {
        name: "listPets",
        summary: "List all pets",
        tags: ["pets"],
        path: ["pets"],
        method: "GET",
        query: {
            limit: 10
        },
        headers: undefined,
        responses: {
            status: 200,
            description: 'A paged array of pets',
            headers: {
                "x-next": "?"
            },
            content: {
                id: 1,
                name:"Bello",
                tag:"DOG"
            }
        }
    }
    const res = schema.parse(reqRes)
    console.log("---res", res)
})

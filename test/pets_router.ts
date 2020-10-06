import * as z from "../mod.ts";
import {OpenAPIObject} from "../utils/openapi3/OpenApi.ts";
import {assertEquals} from "https://deno.land/std/testing/asserts.ts";
import {openApi} from "../openapi.ts";
import * as yaml from "https://deno.land/std/encoding/yaml.ts";
import {ResponsesForRequest} from "../lib/router.ts";

const petApi =
    "https://raw.githubusercontent.com/OAI/OpenAPI-Specification/3.0.3/examples/v3.0/petstore.yaml";

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


const schema = z.router([
    z.route({
        name: "listPets",
        summary: "List all pets",
        tags: [z.literal("pets")],
        method: "GET",
        path: [z.literal("pets")],
        query: {
            limit: z.parameter(z.integer("int32").max(100))
                .description("How many items to return at one time (max 100)"),
        },
        headers: {},
        responses: [
            z.response({
                status: 200,
                description: "A paged array of pets",
                headers: {
                    "x-next": z.parameter(z.string())
                        .name("x-next")
                        .description("A link to the next page of responses"),
                },
                type: "application/json",
                content: z.reference("Pets", Pets),
            }),
            z.response({
                status: "default",
                description: "unexpected error",
                headers: {},
                type: "application/json",
                content: z.reference("Error", Error),
            }),
        ],
    }),

    z.route({
        name: "showPetById",
        summary: "Info for a specific pet",
        tags: [z.literal("pets")],
        method: "GET",
        path: [
            z.literal("pets"),
            z.parameter(z.string().uuid())
                .name("petId")
                .description("The id of the pet to retrieve"),
        ],
        query: {},
        headers: {},
        responses: [
            z.response({
                status: 200,
                description: "Expected response to a valid request",
                headers: {},
                type: "application/json",
                content: z.reference("Pet", Pet),
            }),
            z.response({
                status: "default",
                description: "unexpected error",
                headers: {},
                type: "application/json",
                content: z.reference("Error", Error),
            }),
        ],
    }),

    z.route({
        name: "createPets",
        summary: "Create a pet",
        tags: [z.literal("pets")],
        method: "POST",
        path: [z.literal("pets")],
        query: {},
        headers: {
            accept: z.parameter(z.literal("application/json")),
        },
        responses: [
            z.response({
                status: 201,
                description: "Null response",
                headers: {},
                type: "application/json",
                content: undefined,
            }),
            z.response({
                status: "default",
                description: "unexpected error",
                headers: {},
                type: "application/json",
                content: z.reference("Error", Error),
            }),
        ],
    }),
]);

const server = {url: "http://petstore.swagger.io/v1"};
const api = openApi(schema, {"version": "1.0.0", "title": "Swagger Petstore", license: {name: "MIT"}}, [server]);
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

    const response: ResponsesForRequest<typeof schema, { method: 'GET', path: ["pets", "b945f0a8-022d-11eb-adc1-0242ac120002"] }> = {
        status: 200,
        headers: {},
    }

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
    const res = schema.parse(showPetById);
    assertEquals(res.name, "showPetById");
});

Deno.test("match", () => {

    const req = {
        path: ["pets", "b945f0a8-022d-11eb-adc1-0242ac120002"],
        method: "GET",
    } as const
    const res = schema.match(req);
    console.log(res)
    assertEquals(res?.name, "showPetById");
});

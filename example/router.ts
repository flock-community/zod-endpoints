import * as z from "../deno_lib/mod.ts";
import {Pet, Pets, Error} from "./model.ts";

export const schema = z.endpoints([
    z.endpoint({
        name: "listPets",
        summary: "List all pets",
        tags: [z.literal("pets")],
        method: "GET",
        path: [z.literal("pets")],
        query: {
            limit: z.parameter(z.integer("int32").max(100))
                .description("How many items to return at one time (max 100)"),
        },
        responses: [
            z.response({
                status: 200,
                description: "A paged array of pets",
                headers: {
                    "x-next": z.parameter(z.string())
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
            z.parameter(z.string().uuid())
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
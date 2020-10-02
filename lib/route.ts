import * as z from "../deps.ts";
import {array, literal, object, string, tuple, undefined as undef, union} from "../deps.ts";
import {parameter} from "./parameter.ts";
import {integer} from "./integer.ts";
import {reference} from "./reference.ts";

const Error = object({
    code: integer(),
    message: string(),
});

const Pet = z.object({
    id: integer("int64"),
    name: string(),
    tag: string().optional(),
});

const Pets = array(reference("Pet", Pet));

export function route(route: {
    name: string,
    method: "GET" | "POST" | "PUT" | "DELETE"
    summary: string,
}) {

    return object({
        name: literal(route.name).default(route.name),
        summary: literal(route.summary).default(route.summary),
        tags: tuple([literal("pets")]).default(["pets"]),
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
    })
}


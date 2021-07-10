"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore TS6133
var globals_1 = require("@jest/globals");
var z = __importStar(require("../index"));
var index_1 = require("../index");
var openapi_1 = require("../openapi");
globals_1.test("test project", function () {
    var route = {
        name: z.literal("GET_USER").default("GET_USER"),
        method: z.literal("GET"),
        path: z.tuple([z.literal("user")]),
        summary: z.undefined(),
        tags: z.tuple([z.literal("a"), z.literal("b")]).default(["a", "b"]),
        query: z.object({
            test: index_1.parameter(z.number().max(100).optional()).description("How many items to return at one time (max 100)"),
        }),
        headers: z.object({}),
        body: z.undefined(),
        responses: z.union([
            z.object({
                description: z.literal("List of projects"),
                status: z.literal(200),
                headers: z.object({}),
                body: z.object({
                    type: z.literal("application/json"),
                    content: index_1.component(z.object({
                        uuid: z.string().uuid(),
                        name: z.string(),
                    })),
                }),
            }),
            z.object({
                description: z.literal("Not projects found"),
                status: z.literal(404),
                headers: z.object({}),
                body: z.undefined(),
            }),
        ]),
    };
    var res = openapi_1.openApi(z.object(route));
    var exp = {
        openapi: "3.0.0",
        info: {
            version: "1.0.0",
            title: "No title",
        },
        servers: [],
        paths: {
            "/user": {
                get: {
                    operationId: "GET_USER",
                    parameters: [
                        {
                            description: "How many items to return at one time (max 100)",
                            in: "query",
                            name: "test",
                            required: false,
                            schema: {
                                format: "int32",
                                type: "integer",
                            },
                        },
                    ],
                    summary: undefined,
                    tags: ["a", "b"],
                    requestBody: undefined,
                    responses: {
                        "200": {
                            description: "List of projects",
                            headers: undefined,
                            content: {
                                "application/json": {
                                    schema: {
                                        properties: {
                                            name: {
                                                type: "string",
                                            },
                                            uuid: {
                                                type: "string",
                                            },
                                        },
                                        required: ["uuid", "name"],
                                        type: "object",
                                    },
                                },
                            },
                        },
                        "404": {
                            description: "Not projects found",
                            headers: undefined,
                            content: undefined,
                        },
                    },
                },
            },
        },
        components: undefined,
    };
    globals_1.expect(res).toEqual(exp);
});

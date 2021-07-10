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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore TS6133
var globals_1 = require("@jest/globals");
var petstore_1 = __importDefault(require("../data/petstore"));
var z = __importStar(require("../index"));
var openapi_1 = require("../openapi");
var Error = z.object({
    code: z.integer(),
    message: z.string(),
});
var Pet = z.object({
    id: z.integer("int64"),
    name: z.string(),
    tag: z.string().optional(),
});
var Pets = z.array(z.reference("Pet", Pet));
var schema = z.endpoints([
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
var server = { url: "http://petstore.swagger.io/v1" };
var api = openapi_1.openApi(schema, { version: "1.0.0", title: "Swagger Petstore", license: { name: "MIT" } }, [server]);
globals_1.test("compare open api schema", function () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    function compare(actual, expected) {
        var value = JSON.parse(JSON.stringify(actual));
        globals_1.expect(value).toEqual(expected);
    }
    compare(api.paths["/pets"].get, petstore_1.default.paths["/pets"].get);
    compare(api.paths["/pets/{petId}"].get, petstore_1.default.paths["/pets/{petId}"].get);
    compare(api.paths["/pets"].post, petstore_1.default.paths["/pets"].post);
    compare((_b = (_a = api.components) === null || _a === void 0 ? void 0 : _a.schemas) === null || _b === void 0 ? void 0 : _b.Error, (_d = (_c = petstore_1.default.components) === null || _c === void 0 ? void 0 : _c.schemas) === null || _d === void 0 ? void 0 : _d.Error);
    compare((_f = (_e = api.components) === null || _e === void 0 ? void 0 : _e.schemas) === null || _f === void 0 ? void 0 : _f.Pet, (_h = (_g = petstore_1.default.components) === null || _g === void 0 ? void 0 : _g.schemas) === null || _h === void 0 ? void 0 : _h.Pet);
    compare((_k = (_j = api.components) === null || _j === void 0 ? void 0 : _j.schemas) === null || _k === void 0 ? void 0 : _k.Pets, (_m = (_l = petstore_1.default.components) === null || _l === void 0 ? void 0 : _l.schemas) === null || _m === void 0 ? void 0 : _m.Pets);
    compare(api, petstore_1.default);
});
globals_1.test("validate example request", function () {
    var listPets = {
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
    globals_1.expect(schema.parse(listPets).name).toEqual("listPets");
    var showPetById = {
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
    var res = schema.parse(showPetById);
    globals_1.expect(res.name).toEqual("showPetById");
});

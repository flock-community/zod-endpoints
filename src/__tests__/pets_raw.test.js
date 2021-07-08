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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
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
var schema = z.union([
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
globals_1.test("api interface", function () {
    var api = {
        listPets: function () {
            return Promise.resolve({
                status: 200,
                headers: { "x-next": "abc" },
                body: { type: "application/json", content: [] },
            });
        },
        showPetById: function () {
            return Promise.resolve({
                status: 200,
                headers: {},
                body: { type: "application/json", content: { id: 1, name: "Pet" } },
            });
        },
        createPets: function () { return Promise.resolve({ status: 201, headers: {} }); },
    };
    globals_1.expect(api).toBeTruthy();
});
globals_1.test("client interface", function () { return __awaiter(void 0, void 0, void 0, function () {
    var client, res;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                client = function (req) {
                    var _a;
                    var match = z.matchRequest(schema, req);
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
                                    name: (_a = match === null || match === void 0 ? void 0 : match.shape.name.parse(undefined)) !== null && _a !== void 0 ? _a : "",
                                },
                            ],
                        },
                    });
                };
                return [4 /*yield*/, client({
                        method: "GET",
                        path: ["pets"],
                        headers: {},
                        query: {},
                        body: undefined,
                    })];
            case 1:
                res = _a.sent();
                globals_1.expect(res.body).toEqual({
                    type: "application/json",
                    content: [{ id: 123, name: "listPets" }],
                });
                return [2 /*return*/];
        }
    });
}); });
globals_1.test("compare open api schema", function () { return __awaiter(void 0, void 0, void 0, function () {
    function compare(actual, expected) {
        var value = JSON.parse(JSON.stringify(actual));
        globals_1.expect(value).toEqual(expected);
    }
    var server, api;
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    return __generator(this, function (_o) {
        server = { url: "http://petstore.swagger.io/v1" };
        api = openapi_1.openApi(schema, {
            version: "1.0.0",
            title: "Swagger Petstore",
            license: { name: "MIT" },
        }, [server]);
        compare(api.paths["/pets"].get, petstore_1.default.paths["/pets"].get);
        compare(api.paths["/pets/{petId}"].get, petstore_1.default.paths["/pets/{petId}"].get);
        compare(api.paths["/pets"].post, petstore_1.default.paths["/pets"].post);
        compare((_b = (_a = api.components) === null || _a === void 0 ? void 0 : _a.schemas) === null || _b === void 0 ? void 0 : _b.Error, (_d = (_c = petstore_1.default.components) === null || _c === void 0 ? void 0 : _c.schemas) === null || _d === void 0 ? void 0 : _d.Error);
        compare((_f = (_e = api.components) === null || _e === void 0 ? void 0 : _e.schemas) === null || _f === void 0 ? void 0 : _f.Pet, (_h = (_g = petstore_1.default.components) === null || _g === void 0 ? void 0 : _g.schemas) === null || _h === void 0 ? void 0 : _h.Pet);
        compare((_k = (_j = api.components) === null || _j === void 0 ? void 0 : _j.schemas) === null || _k === void 0 ? void 0 : _k.Pets, (_m = (_l = petstore_1.default.components) === null || _l === void 0 ? void 0 : _l.schemas) === null || _m === void 0 ? void 0 : _m.Pets);
        compare(api, petstore_1.default);
        return [2 /*return*/];
    });
}); });
globals_1.test("validate example request", function () {
    var listPets = {
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
    globals_1.expect(schema.parse(listPets).name).toEqual("listPets");
    var showPetById = {
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
    globals_1.expect(schema.parse(showPetById).name).toEqual("showPetById");
});

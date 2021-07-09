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
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore TS6133
var globals_1 = require("@jest/globals");
var z = __importStar(require("../index"));
var openapi_1 = require("../openapi");
globals_1.test("minimal one endpoint", function () { return __awaiter(void 0, void 0, void 0, function () {
    var schema, api, res;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                schema = z.endpoints([
                    z.endpoint({
                        name: "A",
                        method: "GET",
                        responses: [
                            z.response({
                                status: 200,
                            }),
                        ],
                    }),
                ]);
                api = {
                    A: function (_a) {
                        var path = _a.path;
                        globals_1.expect(path[0]).toEqual("");
                        return Promise.resolve({
                            status: 200,
                        });
                    },
                };
                return [4 /*yield*/, api["A"]({
                        method: "GET",
                        path: [""],
                        query: {},
                        headers: {},
                    })];
            case 1:
                res = _a.sent();
                globals_1.expect(res).toEqual({ status: 200 });
                return [2 /*return*/];
        }
    });
}); });
globals_1.test("minimal endpoint two endpoints", function () { return __awaiter(void 0, void 0, void 0, function () {
    var schema, api, res, open;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                schema = z.union([
                    z.endpoint({
                        name: "A",
                        method: "GET",
                        path: [z.literal("a")],
                        responses: [
                            z.response({
                                status: 200,
                            }),
                        ],
                    }),
                    z.endpoint({
                        name: "B",
                        method: "POST",
                        path: [z.literal("b")],
                        responses: [
                            z.response({
                                status: 200,
                                body: [
                                    z.body({
                                        type: "application/json",
                                        content: z.object({
                                            b: z.string(),
                                        }),
                                    }),
                                    z.body({
                                        type: "plain/text",
                                        content: z.object({
                                            c: z.string(),
                                        }),
                                    }),
                                ],
                            }),
                        ],
                    }),
                ]);
                api = {
                    A: function () {
                        return Promise.resolve({
                            status: 200,
                        });
                    },
                    B: function () {
                        return Promise.resolve({
                            status: 200,
                            body: { type: "application/json", content: { b: "b" } },
                        });
                    },
                };
                return [4 /*yield*/, api["B"]({
                        method: "POST",
                        path: ["b"],
                        query: {},
                        headers: {},
                    })];
            case 1:
                res = _a.sent();
                globals_1.expect(res).toEqual({
                    status: 200,
                    body: {
                        type: "application/json",
                        content: { b: "b" },
                    },
                });
                open = openapi_1.openApi(schema);
                globals_1.expect(open).toEqual({
                    components: undefined,
                    info: {
                        title: "No title",
                        version: "1.0.0",
                    },
                    openapi: "3.0.0",
                    paths: {
                        "/a": {
                            get: {
                                operationId: "A",
                                parameters: undefined,
                                requestBody: undefined,
                                responses: {
                                    200: {
                                        content: undefined,
                                        description: undefined,
                                        headers: undefined,
                                    },
                                },
                                summary: undefined,
                                tags: undefined,
                            },
                        },
                        "/b": {
                            post: {
                                operationId: "B",
                                parameters: undefined,
                                requestBody: undefined,
                                responses: {
                                    200: {
                                        content: {
                                            "application/json": {
                                                schema: {
                                                    properties: {
                                                        b: {
                                                            type: "string",
                                                        },
                                                    },
                                                    required: ["b"],
                                                    type: "object",
                                                },
                                            },
                                            "plain/text": {
                                                schema: {
                                                    properties: {
                                                        c: {
                                                            type: "string",
                                                        },
                                                    },
                                                    required: ["c"],
                                                    type: "object",
                                                },
                                            },
                                        },
                                        description: undefined,
                                        headers: undefined,
                                    },
                                },
                                summary: undefined,
                                tags: undefined,
                            },
                        },
                    },
                    servers: [],
                });
                return [2 /*return*/];
        }
    });
}); });
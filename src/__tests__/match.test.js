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
globals_1.test("match requset", function () {
    var a = z.endpoint({
        name: "A",
        method: "GET",
        path: [z.literal("a")],
        query: {
            next: z.parameter(z.string()),
        },
        responses: [
            z.response({
                status: 200,
            }),
        ],
    });
    var b = z.endpoint({
        name: "B",
        method: "POST",
        path: [z.literal("b")],
        query: {
            next: z.parameter(z.string().optional()),
        },
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
    });
    var schema = z.union([a, b]);
    var reqA = {
        method: "GET",
        path: ["a"],
        query: {
            next: "a",
        },
        headers: {},
    };
    var reqB = {
        method: "POST",
        path: ["b"],
        query: {
            next: undefined,
        },
        headers: {},
    };
    globals_1.expect(z.matchRequest(schema, reqA)).toEqual(a);
    globals_1.expect(z.matchRequest(schema, reqB)).toEqual(b);
});

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
globals_1.test("type string", function () {
    var zod = z.string();
    globals_1.expect(z.createSchema(zod)).toEqual({
        type: "string",
    });
});
globals_1.test("type object", function () {
    var zod = z.object({
        id: z.number(),
        name: z.string(),
        tag: z.string().optional(),
    });
    globals_1.expect(z.createSchema(zod)).toEqual({
        type: "object",
        required: ["id", "name"],
        properties: {
            id: {
                type: "integer",
                format: "int32",
            },
            name: {
                type: "string",
            },
            tag: {
                type: "string",
            },
        },
    });
});
globals_1.test("type nested object", function () {
    var zod = z.object({
        id: z.number(),
        name: z.string(),
        obj: z
            .object({
            test: z.string(),
        })
            .optional(),
    });
    globals_1.expect(z.createSchema(zod)).toEqual({
        type: "object",
        required: ["id", "name"],
        properties: {
            id: {
                type: "integer",
                format: "int32",
            },
            name: {
                type: "string",
            },
            obj: {
                properties: {
                    test: {
                        type: "string",
                    },
                },
                required: ["test"],
                type: "object",
            },
        },
    });
});
globals_1.test("type array", function () {
    var zod = z.array(z.string());
    globals_1.expect(z.createSchema(zod)).toEqual({
        type: "array",
        items: {
            type: "string",
        },
    });
});
globals_1.test("type integer", function () {
    var int32 = z.integer();
    globals_1.expect(z.createSchema(int32)).toEqual({
        format: "int32",
        type: "integer",
    });
    var int64 = z.integer("int64").max(100);
    globals_1.expect(z.createSchema(int64)).toEqual({
        format: "int64",
        type: "integer",
    });
});

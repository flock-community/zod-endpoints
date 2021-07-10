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
globals_1.test("parse bigint", function () {
    var bigint = z.bigint();
    var res = bigint.parse(BigInt(2));
    globals_1.expect(res).toEqual(BigInt(2));
});
globals_1.test("parse pet", function () {
    var Pet = z.object({
        id: z.bigint(),
        name: z.string(),
        tag: z.string().optional(),
    });
    var Pets = z.array(z.reference("Pet", Pet));
    var arr = [
        { id: BigInt(0), name: "a", tag: "Test" },
        { id: BigInt(1), name: "b", tag: "Test" },
    ];
    globals_1.expect(Pets.parse(arr)).toEqual([
        { id: BigInt(0), name: "a", tag: "Test" },
        { id: BigInt(1), name: "b", tag: "Test" },
    ]);
});

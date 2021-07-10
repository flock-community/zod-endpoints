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
globals_1.test("parameter with number", function () {
    var n = z
        .parameter(z.number().max(100))
        .name("limit")
        .description("How many items to return at one time (max 100)");
    globals_1.expect(n.parse(50)).toEqual(50);
    try {
        n.parse(400);
    }
    catch (err) {
        var zerr = err;
        globals_1.expect(zerr.issues[0].code).toEqual(z.ZodIssueCode.too_big);
        globals_1.expect(zerr.issues[0].message).toEqual("Value should be less than or equal to 100");
    }
});
globals_1.test("parameter with string", function () {
    var s = z
        .parameter(z.string().max(7))
        .name("limit")
        .description("How many items to return at one time (max 100)");
    globals_1.expect(s.parse("123456")).toEqual("123456");
    try {
        s.parse("12345678");
    }
    catch (err) {
        var zerr = err;
        globals_1.expect(zerr.issues[0].code).toEqual(z.ZodIssueCode.too_big);
        globals_1.expect(zerr.issues[0].message).toEqual("Should be at most 7 characters long");
    }
});

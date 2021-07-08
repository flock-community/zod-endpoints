"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var zod_1 = require("zod");
// const a:A = {
//   name: z.literal("a")
// }
var a = "a";
var b = zod_1.z.literal(a).default(a);
console.log(b);

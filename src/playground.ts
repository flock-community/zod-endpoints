import { z } from "zod";

// const a:A = {
//   name: z.literal("a")
// }
const a = "a";
const b: z.ZodDefault<z.ZodLiteral<string>> = z.literal(a).default(a);

console.log(b);

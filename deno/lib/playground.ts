export * from "https://raw.githubusercontent.com/colinhacks/zod/master/deno/lib/mod.ts"

// const a:A = {
//   name: z.literal("a")
// }
const a = "a";
const b: z.ZodDefault<z.ZodLiteral<string>> = z.literal(a).default(a);

console.log(b);

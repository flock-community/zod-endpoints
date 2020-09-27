import * as z from "../deps.ts";

function assertUnreachable(x: never): never {
  throw new Error("Didn't expect to get here");
}

export type A = {
  name: z.ZodLiteral<string>;
  test: z.ZodLiteral<string>;
};

type Http = z.ZodObject<{
  name: z.ZodTransformer<
    z.ZodOptional<z.ZodLiteral<any>>,
    z.ZodLiteral<string>
  >;
  method: z.ZodLiteral<"GET" | "POST">;
  headers: z.ZodObject<{[key:string]:z.ZodLiteral<string>}>
}>;

type HttpUnion = z.ZodUnion<[Http, Http, ...Http[]]>;

const route: HttpUnion = z.union([
  z.object({
    name: z.literal("A").default("A"),
    method: z.literal("GET"),
    headers: z.object({})
  }),
  z.object({
    name: z.literal("B").default("B"),
    method: z.literal("POST"),
    headers: z.object({})
  }),
]);

type Routes = z.infer<typeof route>;

function api(routes: Routes) {
  switch (routes.name) {
    case "A":
      return "A";
    case "B":
      return "B";
  }
}

const x = route.parse({ method: "POST" });

route._def.options
  .map((option) => option._def.shape())
  .forEach((shape) => {
    console.log(shape.name._def.output._def.value);
    console.log(shape.method._def.value);
    console.log("----");
  });

console.log(api(x));

import * as z from "./deps.ts";

type Route = {
  summary?: string;
  obj?: {};
};
type RouteMapper<T extends Route> = z.ZodObject<{
  summary: T["summary"] extends undefined ? z.ZodUndefined
    : z.ZodTransformer<
      z.ZodOptional<z.ZodLiteral<T["summary"]>>,
      z.ZodLiteral<T["summary"]>
    >;
  obj: T["obj"] extends z.ZodRawShape ? z.ZodObject<T["obj"]> : z.ZodUndefined;
}>;

type X = z.output<RouteMapper<{ summary: undefined }>>;
type A = RouteMapper<{ summary: "a"; obj: { a: "a" } }>;

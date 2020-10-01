import * as z from "./deps.ts";

type P = [...string[]];

const p: P = ["a", "a", "a"];

type Default = z.ZodTransformer<
  z.ZodOptional<z.ZodTuple<any>>,
  z.ZodTuple<[z.ZodLiteral<string>, ...z.ZodLiteral<string>[]]>
>;

const tuple: Default = z.tuple(
  [z.literal("a"), z.literal("a"), z.literal("a"), z.literal("a")],
).default(["a", "a", "a", "a"]);

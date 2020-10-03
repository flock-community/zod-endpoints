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

function stringifyAll(...elements) {
  return elements.map((x) => String(x));
}

type Strings = [string, string];
type Numbers = [number, number];

type StrStrNumNumBool = [...Strings, ...Numbers, boolean];

type Http = {
  readonly method: "GET" | "POST";
  readonly path: string;
  readonly tags: readonly string[];
};

function y<T extends Http>(y: Readonly<T>): T {
  return y;
}

const asdf = y({
  method: "POST",
  path: "/a/b",
  tags: ["a", "b"],
});

type Res = typeof asdf;

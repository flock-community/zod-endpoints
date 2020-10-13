import * as z from "../deps.ts";
import {
  Headers,
  HttpObject,
  HttpOptions,
  HttpResponseObject,
  HttpSchema,
  HttpUnion,
  Path,
} from "../lib/domain.ts";
import { Parameter } from "./parameter.ts";
import { Reference } from "./reference.ts";

export type Request = {
  name: string;
  summary?: string;
  tags?: [z.ZodLiteral<string>, ...z.ZodLiteral<string>[]] | [];
  method: "GET" | "POST" | "PUT" | "DELETE";
  path?: [Path, ...Path[]];
  query?: { [key: string]: Parameter };
  headers?: { [key: string]: Parameter };
  type?: string;
  body?: z.ZodType<any, any, any>;
};

export type Response = {
  description?: string;
  status: number | string;
  type?: string;
  headers?: { [key: string]: Parameter };
  content?: z.ZodType<any, any, any>;
};

export type Route = Request & {
  responses?:
    | [HttpResponseObject, HttpResponseObject, ...HttpResponseObject[]]
    | [HttpResponseObject];
};

export function router<T extends HttpObject>(types: [T]): T;
export function router<
  T1 extends HttpObject,
  T2 extends HttpObject,
  T3 extends HttpObject,
>(types: [T1, T2, ...T3[]]): z.ZodUnion<[T1, T2, ...T3[]]>;
export function router<T extends HttpObject>(
  types: [T] | [T, T, ...T[]],
): T | z.ZodUnion<[T, T, ...T[]]> {
  // @ts-ignore
  return (types.length === 1) ? types[0] : z.union<[T, T, ...T[]]>(types);
}

export type RouteMapper<T extends Route> = z.ZodObject<{
  name: z.ZodTransformer<
    z.ZodOptional<z.ZodLiteral<T["name"]>>,
    z.ZodLiteral<T["name"]>
  >;
  summary: T["summary"] extends string ? z.ZodTransformer<
    z.ZodOptional<z.ZodLiteral<T["summary"]>>,
    z.ZodLiteral<T["summary"]>
  >
    : z.ZodUndefined;
  tags: T["tags"] extends [z.ZodTypeAny, ...z.ZodTypeAny[]] | []
    ? z.ZodTransformer<
      z.ZodOptional<z.ZodTuple<T["tags"]>>,
      z.ZodTuple<T["tags"]>
    >
    : z.ZodUndefined;
  method: z.ZodLiteral<T["method"]>;
  path: T["path"] extends [Path, ...Path[]] ? z.ZodTuple<T["path"]>
    : z.ZodTuple<[z.ZodLiteral<"">]>;
  query: T["query"] extends z.ZodRawShape ? z.ZodObject<T["query"]>
    : z.ZodUndefined;
  headers: T["headers"] extends z.ZodRawShape ? z.ZodObject<T["headers"]>
    : z.ZodUndefined;
  type: T["type"] extends string ? z.ZodLiteral<T["type"]> : z.ZodUndefined;
  body: T["body"] extends z.ZodType<any, any, any> ? T["body"]
      : z.ZodUndefined;
  responses: T["responses"] extends
    [HttpResponseObject, HttpResponseObject, ...HttpResponseObject[]]
    ? z.ZodUnion<T["responses"]>
    : T["responses"] extends [HttpResponseObject] ? T["responses"][0]
    : z.ZodUndefined;
}>;
export function route<T extends Route>(route: Readonly<T>): RouteMapper<T> {
  // @ts-ignore
  return z.object({
    name: z.literal(route.name).default(route.name),
    summary: route.summary !== undefined
      ? z.literal(route.summary).default(route.summary)
      : z.undefined(),
    tags: route.tags !== undefined
      ? // @ts-ignore
        z.tuple(route.tags).default(route.tags.map((_) => _._def.value))
      : z.undefined(),
    method: z.literal(route.method),
    // @ts-ignore
    path: route.path !== undefined ? z.tuple(route.path) : [],
    query: route.query !== undefined
      ? z.object(route.query as z.ZodRawShape)
      : z.undefined(),
    headers: route.headers !== undefined
      ? z.object(route.headers as z.ZodRawShape)
      : z.undefined(),
    type: route.type !== undefined
        ? z.literal(route.type)
        : z.undefined(),
    body: route.body !== undefined
        ? route.body as z.ZodType<any, any, any>
        : z.undefined(),
    // @ts-ignore
    responses: route.responses !== undefined
      ? // @ts-ignore
        z.union(route.responses)
      : z.undefined(),
  });
}

export type ResponseMapper<T extends Response> = z.ZodObject<{
  description: T["description"] extends string ? z.ZodLiteral<T["description"]>
    : z.ZodUndefined;
  status: z.ZodLiteral<T["status"]>;
  headers: T["headers"] extends z.ZodRawShape ? z.ZodObject<T["headers"]>
      : z.ZodUndefined;
  type: T["type"] extends string ? z.ZodLiteral<T["type"]> : z.ZodUndefined;
  content: T["content"] extends z.ZodType<any, any, any> ? T["content"]
    : z.ZodUndefined;
}>;
export function response<T extends Response>(
  response: Readonly<T>,
): ResponseMapper<T> {
  // @ts-ignore
  return z.object({
    status: z.literal(response.status),
    description: z.literal(response.description),
    headers: response.headers !== undefined
      ? z.object(response.headers as z.ZodRawShape)
      : z.undefined(),
    type: response.type !== undefined
      ? z.literal(response.type)
      : z.undefined(),
    content: response.content !== undefined
      ? response.content as z.ZodType<any, any, any>
      : z.undefined(),
  });
}

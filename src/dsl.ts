import * as z from "./deps";
import {
  Content,
  HttpBodyObject,
  HttpBodyUnion,
  HttpObject,
  HttpResponseObject,
  Path
} from "./model";
import { Parameter } from "./parameter";

export type Body = {
  readonly type: string;
  readonly content: Content;
};

export type Request = {
  readonly name: string;
  readonly summary?: string;
  readonly tags?: [z.ZodLiteral<string>, ...z.ZodLiteral<string>[]] | [];
  readonly method: "GET" | "POST" | "PUT" | "DELETE";
  readonly path?: [Path, ...Path[]];
  readonly query?: { [key: string]: Parameter };
  readonly headers?: { [key: string]: Parameter };
  readonly type?: string;
  readonly body?:
    | [HttpBodyObject, HttpBodyObject, ...HttpBodyObject[]]
    | [HttpBodyObject]
    | HttpBodyObject;
};

export type Response = {
  readonly description?: string;
  readonly status: number | string;
  readonly headers?: { [key: string]: Parameter };
  readonly body?:
    | [HttpBodyObject, HttpBodyObject, ...HttpBodyObject[]]
    | [HttpBodyObject]
    | HttpBodyObject;
};

export type Endpoint = Request & {
  responses?:
    | [HttpResponseObject, HttpResponseObject, ...HttpResponseObject[]]
    | [HttpResponseObject];
};

export function endpoints<T extends HttpObject>(types: [T]): T;
export function endpoints<
    T1 extends HttpObject,
    T2 extends HttpObject,
    T3 extends HttpObject,
    >(types: [T1, T2, ...T3[]]): z.ZodUnion<[T1, T2, ...T3[]]>;
export function endpoints<T extends HttpObject>(
    types: [T] | [T, T, ...T[]],
): T | z.ZodUnion<[T, T, ...T[]]> {
  // @ts-ignore
  return (types.length === 1) ? types[0] : z.union<[T, T, ...T[]]>(types);
}

export type EndpointMapper<T extends Endpoint> = z.ZodObject<{
  name: z.ZodTransformer<
    z.ZodOptional<z.ZodLiteral<T["name"]>>,
    z.ZodLiteral<T["name"]>
  >;
  summary: T["summary"] extends string
    ? z.ZodTransformer<
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
  path: T["path"] extends [Path, ...Path[]]
    ? z.ZodTuple<T["path"]>
    : z.ZodTuple<[z.ZodLiteral<"">]>;
  query: T["query"] extends z.ZodRawShape
    ? z.ZodObject<T["query"]>
    : z.ZodUndefined;
  headers: T["headers"] extends z.ZodRawShape
    ? z.ZodObject<T["headers"]>
    : z.ZodUndefined;
  body: T["body"] extends [HttpBodyObject, HttpBodyObject, ...HttpBodyObject[]]
    ? z.ZodUnion<T["body"]>
    : T["body"] extends [HttpBodyObject]
    ? T["body"][0]
    : T["body"] extends HttpBodyObject
    ? T["body"]
    : z.ZodUndefined;
  responses: T["responses"] extends [
    HttpResponseObject,
    HttpResponseObject,
    ...HttpResponseObject[]
  ]
    ? z.ZodUnion<T["responses"]>
    : T["responses"] extends [HttpResponseObject]
    ? T["responses"][0]
    : z.ZodUndefined;
}>;
export function endpoint<T extends Endpoint>(endpoint: Readonly<T>): EndpointMapper<T> {
  // @ts-ignore
  return z.object({
    name: z.literal(endpoint.name).default(endpoint.name),
    summary:
      endpoint.summary !== undefined
        ? z.literal(endpoint.summary).default(endpoint.summary)
        : z.undefined(),
    tags:
      endpoint.tags !== undefined
        ? // @ts-ignore
          z.tuple(endpoint.tags).default(endpoint.tags.map(_ => _._def.value))
        : z.undefined(),
    method: z.literal(endpoint.method),
    // @ts-ignore
    path: endpoint.path !== undefined ? z.tuple(endpoint.path) : [],
    query:
      endpoint.query !== undefined
        ? z.object(endpoint.query as z.ZodRawShape)
        : z.undefined(),
    headers:
      endpoint.headers !== undefined
        ? z.object(endpoint.headers as z.ZodRawShape)
        : z.undefined(),
    // @ts-ignore
    body: transformBody(endpoint.body),
    // @ts-ignore
    responses:
      endpoint.responses !== undefined
        ? // @ts-ignore
          z.union(endpoint.responses)
        : z.undefined()
  });
}

export type BodyMapper<T extends Body> = z.ZodObject<{
  type: z.ZodLiteral<T["type"]>;
  content: T["content"];
}>;

export function body<T extends Body>(body: Readonly<T>): BodyMapper<T> {
  return z.object({
    type: z.literal(body.type),
    content: body.content
  });
}

export type ResponseMapper<T extends Response> = z.ZodObject<{
  description: T["description"] extends string
    ? z.ZodLiteral<T["description"]>
    : z.ZodUndefined;
  status: z.ZodLiteral<T["status"]>;
  headers: T["headers"] extends z.ZodRawShape
    ? z.ZodObject<T["headers"]>
    : z.ZodUndefined;
  body: T["body"] extends [HttpBodyObject, HttpBodyObject, ...HttpBodyObject[]]
    ? z.ZodUnion<T["body"]>
    : T["body"] extends [HttpBodyObject]
    ? T["body"][0]
    : T["body"] extends HttpBodyObject
    ? T["body"]
    : z.ZodUndefined;
}>;
export function response<T extends Response>(
  response: Readonly<T>
): ResponseMapper<T> {
  // @ts-ignore
  return z.object({
    status: z.literal(response.status),
    description: z.literal(response.description),
    headers:
      response.headers !== undefined
        ? z.object(response.headers as z.ZodRawShape)
        : z.undefined(),
    body: transformBody(response.body)
  });
}

function transformBody(
  body?:
    | [HttpBodyObject, HttpBodyObject, ...HttpBodyObject[]]
    | [HttpBodyObject]
    | HttpBodyObject
): HttpBodyUnion {
  if (body === undefined) {
    return z.undefined();
  }
  if (Array.isArray(body)) {
    if (body.length === 1) {
      return body[0];
    }
    // @ts-ignore
    return z.union(body);
  }
  return body;
}

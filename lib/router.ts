import * as z from "../deps.ts";
import { HttpObject, HttpResponse } from "../lib/domain.ts";
import { Parameter } from "./parameter.ts";
import { Reference } from "./reference.ts";

export class Router<
  T extends [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]],
> extends z.ZodType<
  T[number]["_output"],
  z.ZodUnionDef<T>,
  T[number]["_input"]
> {
  toJSON = (): object => ({
    t: this._def.t,
    options: this._def.options.map((x) => x.toJSON()),
  });

  get options() {
    return this._def.options;
  }

  match = (method: string): HttpObject | undefined => {
    return undefined;
  };

  static create = <T extends [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]>(
    types: T,
  ): Router<T> => {
    return new Router({
      t: z.ZodTypes.union,
      options: types,
    });
  };
}

export const router = Router.create;

type Response = {
  status: number | string;
  headers: Record<string, Parameter>;
  description: string;
  content?: Reference;
};

export function response<T extends Response>(response: Readonly<T>) {
  return z.object({
    status: z.literal(response.status),
    description: z.literal(response.description),
    headers: z.object(response.headers),
    content: response.content ?? z.undefined(),
  });
}

type Route = {
  name: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  summary: string;
  tags: [z.ZodLiteral<string>, ...z.ZodLiteral<string>[]];
  path: [
    z.ZodLiteral<string> | Parameter,
    ...(z.ZodLiteral<string> | Parameter)[],
  ];
  query: Record<string, Parameter>;
  headers: Record<string, Parameter>;
  responses: [HttpResponse, HttpResponse, ...HttpResponse[]];
};

export function route<T extends Route>(route: Readonly<T>) {
  return z.object({
    name: z.literal(route.name).default(route.name),
    summary: z.literal(route.summary).default(route.summary),
    // @ts-ignore
    tags: z.tuple(route.tags).default(route.tags.map((_) => _._def.value)),
    path: z.tuple(route.path),
    method: z.literal(route.method),
    query: z.object(route.query),
    headers: z.object(route.headers ?? {}),
    responses: z.union(route.responses),
  });
}

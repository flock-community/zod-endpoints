import * as z from "../deps.ts";
import { HttpObject, HttpResponseObject } from "../lib/domain.ts";
import { Parameter } from "./parameter.ts";
import { Reference } from "./reference.ts";
import {ZodUndefined} from "../deps.ts";

type Request = {
  name: string;
  summary: string;
  tags: [z.ZodLiteral<string>, ...z.ZodLiteral<string>[]];
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: [
    z.ZodLiteral<string> | Parameter,
    ...(z.ZodLiteral<string> | Parameter)[],
  ];
  query: Record<string, Parameter>;
  headers: Record<string, Parameter>;
};

type Response = {
  status: number | string;
  headers: Record<string, Parameter>;
  description: string;
  type: string;
  content?: Reference<any>;
};

type Route = Request & {
  responses: [HttpResponseObject, HttpResponseObject, ...HttpResponseObject[]];
};

export class Router<
  T extends [HttpObject, HttpObject, ...HttpObject[]],
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

  match = <R extends unknown>(request: Readonly<R>): Extract<z.output<Router<T>>, Readonly<R>> | undefined => {
    // @ts-ignore
    return z.union(this._def.options.map(res => (z.object({
        name: res.shape.name,
        // summary: res.shape.summary,
        // tags: res.shape.tags,
        method: res.shape.method,
        path: res.shape.path,
        // query: res.shape.query,
        // headers: res.shape.headers,
      })))).parse(request)
  };

  static create = <T extends [HttpObject, HttpObject, ...HttpObject[]]>(
    types: T,
  ): Router<T> => {
    return new Router({
      t: z.ZodTypes.union,
      options: types,
    });
  };
}

export const router = Router.create;

export function response<T extends Response>(response: Readonly<T>) {
  return z.object({
    status: z.literal(response.status),
    description: z.literal(response.description),
    headers: z.object(response.headers),
    type: z.literal(response.type),
    content: response.content ?? z.undefined(),
  });
}

export function route<T extends Route, R extends HttpObject>(route: Readonly<T>) {
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

export type ResponsesForRequest<R extends Router<any>,T> = Pick<Extract<z.output<R>, T>['responses'], "status" | "headers" | "content">;

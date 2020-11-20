import * as z from "./deps.ts";
import { Parameter } from "./parameter.ts";
import { Reference } from "./reference.ts";
import { Component } from "./component.ts";

export type Path = z.ZodLiteral<any> | z.ZodString | Parameter;
export type Headers = z.ZodObject<{ [key: string]: Parameter }>;
export type Content =
  | Reference<any>
  | Component<any>
  | z.ZodType<any, any, any>;

export type HttpBody = {
  type: z.ZodLiteral<string>;
  content: Content;
};
export type HttpBodyObject = z.ZodObject<HttpBody>;
export type HttpBodyUnion =
  | HttpBodyObject
  | z.ZodUnion<[HttpBodyObject, HttpBodyObject, ...HttpBodyObject[]]>
  | z.ZodUndefined;

export type HttpRequest = {
  name:
    | z.ZodTransformer<z.ZodOptional<z.ZodLiteral<any>>, z.ZodLiteral<string>>
    | z.ZodUndefined;
  method: z.ZodLiteral<string>;
  path: z.ZodTuple<[Path, ...Path[]]> | z.ZodUndefined;
  summary:
    | z.ZodTransformer<z.ZodOptional<z.ZodLiteral<any>>, z.ZodLiteral<string>>
    | z.ZodUndefined;
  tags:
    | z.ZodTransformer<z.ZodOptional<z.ZodTuple<any>>, z.ZodTuple<any>>
    | z.ZodUndefined;
  query: z.ZodObject<{ [key: string]: Parameter }> | z.ZodUndefined;
  headers: Headers | z.ZodUndefined;
  body: HttpBodyUnion;
};

export type HttpRequestObject = z.ZodObject<HttpRequest>;

export type HttpResponse = {
  status: z.ZodLiteral<number | string>;
  description: z.ZodLiteral<string> | z.ZodUndefined;
  headers: Headers | z.ZodUndefined;
  body: HttpBodyUnion;
};

export type HttpResponseObject = z.ZodObject<HttpResponse>;

export type HttpResponseUnion =
  | HttpResponseObject
  | z.ZodUnion<
      [HttpResponseObject, HttpResponseObject, ...HttpResponseObject[]]
    >;

export type Http = HttpRequest & {
  responses: HttpResponseUnion;
};

export type HttpObject = z.ZodObject<Http>;
export type HttpOptions = [HttpObject, HttpObject, ...HttpObject[]];
export type HttpUnion = z.ZodUnion<HttpOptions>;
export type HttpSchema = HttpObject | HttpUnion;

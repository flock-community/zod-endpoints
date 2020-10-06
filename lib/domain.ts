import * as z  from "../deps.ts";
import { Parameter } from "./parameter.ts";
import { Reference } from "./reference.ts";
import { Component } from "./component.ts";

export type Headers = z.ZodObject<
  {
    [key: string]:
      | z.ZodLiteral<string>
      | z.ZodUnion<
        [z.ZodLiteral<string>, z.ZodLiteral<string>, ...z.ZodLiteral<string>[]]
      >
      | Parameter;
  }
>;
export type Content = Reference<any> | Component<any> | z.ZodUndefined;


export type HttpRequest = {
  name:
      | z.ZodTransformer<z.ZodOptional<z.ZodLiteral<any>>, z.ZodLiteral<string>>
      | z.ZodUndefined;
  method: z.ZodLiteral<string>;
  path: z.ZodTuple<[
        z.ZodLiteral<any> | z.ZodString | Parameter,
    ...(z.ZodLiteral<any> | z.ZodString | Parameter)[],
  ]>;
  summary:
      | z.ZodTransformer<z.ZodOptional<z.ZodLiteral<any>>, z.ZodLiteral<string>>
      | z.ZodUndefined;
  tags: z.ZodTransformer<z.ZodOptional<z.ZodTuple<any>>, z.ZodTuple<any>>| z.ZodUndefined;
  query: z.ZodObject<{ [key: string]: Parameter }>;
  headers: Headers;
};

export type HttpRequestObject = z.ZodObject<HttpRequest>;

export type HttpResponse = {
  status: z.ZodLiteral<number | string>;
  description: z.ZodLiteral<string>;
  headers: Headers;
  type: z.ZodLiteral<string>;
  content: Content;
};

export type HttpResponseObject = z.ZodObject<HttpResponse>;

export type HttpResponses =
    | HttpResponseObject
    | z.ZodUnion<[HttpResponseObject, HttpResponseObject, ...HttpResponseObject[]]>;


export type Http = HttpRequest & {
  responses: HttpResponses;
};
export type HttpObject = z.ZodObject<Http>;

export type HttpUnion = z.ZodUnion<[HttpObject, HttpObject, ...HttpObject[]]>;
export type HttpSchema = HttpObject | HttpUnion;

export type HttpOutput = z.output<HttpObject>
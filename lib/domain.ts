import {
  ZodLiteral,
  ZodObject,
  ZodOptional,
  ZodString,
  ZodTransformer,
  ZodTuple,
  ZodUndefined,
  ZodUnion,
} from "../deps.ts";
import { Parameter } from "./parameter.ts";
import { Reference } from "./reference.ts";
import { Component } from "./component.ts";
import * as z from "../deps.ts";

export type Headers = ZodObject<
  {
    [key: string]:
      | ZodLiteral<string>
      | ZodUnion<
        [ZodLiteral<string>, ZodLiteral<string>, ...ZodLiteral<string>[]]
      >
      | Parameter;
  }
>;
export type Content = Reference | Component | ZodUndefined;

export type HttpResponse = ZodObject<{
  status: ZodLiteral<number | string> | ZodUndefined;
  description: ZodLiteral<string>;
  headers: Headers;
  content: Content;
}>;

export type HttpResponses =
  | HttpResponse
  | ZodUnion<[HttpResponse, HttpResponse, ...HttpResponse[]]>;

export type Http = {
  name:
    | ZodTransformer<ZodOptional<ZodLiteral<any>>, ZodLiteral<string>>
    | ZodUndefined;
  method: ZodLiteral<string>;
  path: ZodTuple<[
    ZodLiteral<any> | ZodString | Parameter,
    ...(ZodLiteral<any> | ZodString | Parameter)[],
  ]>;
  summary:
    | ZodTransformer<ZodOptional<ZodLiteral<any>>, ZodLiteral<string>>
    | ZodUndefined;
  tags: z.ZodTransformer<z.ZodOptional<z.ZodTuple<any>>, z.ZodTuple<any>>;
  query: ZodObject<{ [key: string]: Parameter }>;
  headers: Headers;
  responses: HttpResponses;
};
export type HttpObject = ZodObject<Http>;
export type HttpUnion = ZodUnion<[HttpObject, HttpObject, ...HttpObject[]]>;
export type Schema = HttpObject | HttpUnion;

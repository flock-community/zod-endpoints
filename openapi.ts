import {
  HeadersObject,
  OpenAPIObject,
  OperationObject,
  ParameterObject,
  PathsObject,
  ResponseObject,
  ServerObject,
} from "./utils/openapi3/OpenApi.ts";

import {
  ZodLiteral,
  ZodObject,
  ZodString,
  ZodTuple,
  ZodTypes,
  ZodUndefined,
  ZodUnion,
} from "./deps.ts";

import { objectUtil } from "./deps.ts";
import { Component, Parameter } from "./lib/index.ts";

const base = {
  "openapi": "3.0.0",
  "info": {
    "version": "1.0.0",
    "title": "Swagger Petstore",
    "license": {
      "name": "MIT",
    },
  },
};

type HttpResponse = {
  status: ZodLiteral<number | string> | ZodUndefined;
  description: ZodLiteral<string>;
  headers:
    | ZodObject<{}, any, Record<PropertyKey, string | number>>
    | ZodUndefined;
  content: Component | ZodUndefined;
};
type HttpResponseObject = ZodObject<
  HttpResponse,
  any,
  objectUtil.Flatten<objectUtil.ObjectType<HttpResponse>>
>;

function mapSchema(type: string) {
  switch (type) {
    case "number":
      return {
        type: "integer",
        format: "int32",
      };
    case "string":
      return {
        type: "string",
      };
  }
}

export type Http = {
  name: ZodLiteral<string> | ZodUnion<[ZodLiteral<string>, ZodUndefined]>;
  summary: ZodLiteral<string> | ZodUndefined;
  tags: ZodTuple<[ZodLiteral<string>, ...ZodLiteral<string>[]]> | ZodUndefined;
  method: ZodLiteral<string>;
  path: ZodTuple<
    [
      ZodLiteral<any> | ZodString | Parameter,
      ...(ZodLiteral<any> | ZodString | Parameter)[],
    ]
  >;
  query:
    | ZodObject<{}, any, Record<PropertyKey, string | number>>
    | ZodUndefined;
  headers:
    | ZodObject<{}, any, Record<PropertyKey, string | string[]>>
    | ZodUndefined;
  responses:
    | ZodUnion<
      [HttpResponseObject, HttpResponseObject, ...HttpResponseObject[]]
    >
    | HttpResponseObject
    | ZodUndefined;
};
export type HttpObject = ZodObject<
  Http,
  any,
  objectUtil.Flatten<objectUtil.ObjectType<Http>>
>;
export type HttpUnion = ZodUnion<[HttpObject, HttpObject, ...HttpObject[]]>;

export function openApi(
  schema: HttpUnion,
  servers: ServerObject[],
): OpenAPIObject {
  const paths: PathsObject = schema._def.options.reduce<PathsObject>(
    (acc, cur) => {
      const shape = cur._def.shape();
      const method = shape.method._def.value;
      const path = "/" + shape.path._def.items
        .map((p) => {
          if ("state" in p) {
            return `{${p.state.name}}`;
          }
          if (p._def.t === ZodTypes.string) {
            return `{${p._def.t}}`;
          }
          if (p._def.t === ZodTypes.literal) {
            return p._def.value;
          }
        })
        .join("/");
      return ({
        ...acc,
        [path]: {
          ...acc[path],
          [method.toLowerCase()]: createOperationObject(shape),
        },
      });
    },
    {},
  );

  return { ...base, servers, paths };
}

function createOperationObject(shape: Http): OperationObject {
  return {
    summary: ("value" in shape.summary._def)
      ? shape.summary._def.value
      : undefined,
    operationId: ("value" in shape.name._def) ? shape.name._def.value
    : undefined,
    tags: ("items" in shape.tags._def)
      ? shape.tags._def.items
        .map((x) => ("value" in x._def) ? x._def.value : undefined)
      : undefined,
    parameters: createParameterObject(shape),
    responses: createResponsesObject(shape.responses),
  };
}

function createParameterObject(shape: Http) {
  const res = [
    ...("shape" in shape.query._def)
      ? createQueryParameterObject(shape.query._def.shape())
      : [],
    ...("items" in shape.path._def)
      ? shape.path._def.items.filter((it) => "state" in it).map(
        createPathParameterObject,
      )
      : [],
  ];
  return res.length > 0 ? res : undefined;
}

function createPathParameterObject(
  it: ZodLiteral<any> | ZodString | Parameter,
): ParameterObject {
  return {
    name: ("state" in it && it.state.name) ? it.state.name : it._def,
    in: "path",
    required: true,
    description: ("state" in it) ? it.state.description : undefined,
    schema: mapSchema(it._def.t),
  };
}

function createQueryParameterObject(
  it: Record<PropertyKey, Parameter>,
): ParameterObject[] {
  return Object.keys(it).map((key) => ({
    name: key,
    in: "query",
    description: it[key].state.description,
    required: it[key].state.required,
    schema: mapSchema(it[key].state.type._def.t),
  }));
}

function createResponsesObject(
  responses:
    | ZodUnion<
      [HttpResponseObject, HttpResponseObject, ...HttpResponseObject[]]
    >
    | HttpResponseObject
    | ZodUndefined,
): Record<number, ResponseObject> {
  if ("options" in responses._def) {
    return responses._def.options.reduce((acc, cur) => ({
      ...acc,
      ...createResponseObject(cur._def.shape()),
    }), {});
  }
  if ("shape" in responses._def) {
    return createResponseObject(responses._def.shape());
  }
  return {};
}

function createResponseObject(
  response: HttpResponse,
): Record<number | string, ResponseObject> {
  const name = ("value" in response.status._def)
    ? response.status._def?.value
    : "default";
  return {
    [name]: {
      description: response.description._def.value,
      headers: ("shape" in response.headers._def)
        ? createHeadersObject(response.headers._def.shape())
        : undefined,
      content: ("state" in response.content)
        ? {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/" + response.content.state.name,
            },
          },
        }
        : undefined,
    },
  };
}

function createHeadersObject(
  it: Record<PropertyKey, Parameter>,
): HeadersObject {
  return Object.keys(it).reduce((acc, cur) => ({
    ...acc,
    [cur]: {
      description: it[cur].state.description,
      "schema": mapSchema(it[cur].state.type._def.t),
    },
  }), {});
}

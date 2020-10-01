import {
  ComponentsObject,
  HeadersObject,
  OpenAPIObject,
  OperationObject,
  ParameterObject,
  PathsObject,
  ReferenceObject,
  ResponseObject,
  SchemaObject,
  ServerObject,
} from "./utils/openapi3/OpenApi.ts";

import {
  ZodLiteral,
  ZodObject,
  ZodOptional,
  ZodString,
  ZodTransformer,
  ZodTuple,
  ZodTypes,
  ZodUndefined,
  ZodUnion,
  ZodType,
} from "./deps.ts";

import {
  Parameter,
  Reference,
  ReferenceType,
  Component,
  ComponentType,
} from "./lib/index.ts";
import * as z from "./deps.ts";

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

function mapSchema(type: ComponentType): SchemaObject | undefined {
  switch (type._def.t) {
    case ZodTypes.number:
      if ("format" in type._def) {
        return {
          type: "integer",
          format: type._def.format,
        };
      }
      return {
        type: "integer",
        format: "int32",
      };
    case ZodTypes.bigint:
      return {
        type: "integer",
        format: "int32",
      };
    case ZodTypes.string:
      return {
        type: "string",
      };
  }
}

export function createSchema(
  obj: ReferenceType | Reference | Component,
): SchemaObject | ReferenceObject | undefined {
  if ("reference" in obj) {
    return { "$ref": `#/components/schemas/${obj.state.name}` };
  }
  if ("component" in obj) {
    return createSchema(obj.component);
  }
  if ("innerType" in obj._def) {
    return createSchema(obj._def.innerType);
  }
  if ("type" in obj._def) {
    return {
      type: "array",
      items: createSchema(obj._def.type),
    };
  }
  if ("shape" in obj._def) {
    const shape = obj._def.shape();
    return {
      type: "object",
      properties: Object.keys(shape).reduce((acc, cur) => {
        return {
          ...acc,
          [cur]: createSchema(shape[cur]),
        };
      }, {}),
      required: Object.keys(shape).reduce<string[]>((acc, cur) => {
        if (shape[cur]._def.t !== ZodTypes.optional) {
          return [...acc, cur];
        }
        return acc;
      }, []),
    };
  }
  if ("t" in obj._def) {
    return mapSchema(obj);
  }
  return undefined;
}

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

export function openApi(
  schema: Schema,
  servers: ServerObject[] = [],
): OpenAPIObject {
  const options = ("options" in schema) ? schema.options : [schema];
  const paths = createPaths(options);
  const components = createComponents(options);
  return { ...base, servers, paths, components };
}

function createPaths(options: HttpObject[]): PathsObject {
  return options
    .reduce<PathsObject>(
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
            [method.toLowerCase()]: createOperationObject(cur),
          },
        });
      },
      {},
    );
}

function createComponents(options: HttpObject[]): ComponentsObject | undefined {
  const schemas = options
    .flatMap((http) => {
      const shape = http._def.shape();
      return mapResponsesObject(shape.responses);
    })
    .map((response) => {
      const shape = response._def.shape();
      return shape.content;
    })
    .reduce((acc, cur) => {
      if ("reference" in cur && cur.state.name) {
        return { ...acc, [cur.state.name]: createSchema(cur.reference) };
      } else {
        return acc;
      }
    }, {});
  return (Object.keys(schemas).length > 0)
    ? ({
      schemas: schemas,
    })
    : undefined;
}

function createOperationObject(http: HttpObject): OperationObject {
  const shape = http._def.shape();
  return {
    summary: ("output" in shape.summary._def)
      ? shape.summary._def.output._def.value
      : undefined,
    operationId: ("output" in shape.name._def)
      ? shape.name._def.output._def.value
      : undefined,
    tags: shape.tags._def.output._def.items.map((x: z.ZodLiteral<string>) =>
      ("value" in x._def) ? x._def.value : undefined
    ),
    parameters: createParameterObject(http),
    responses: createResponsesObject(shape.responses),
  };
}

function createParameterObject(http: HttpObject) {
  const shape = http._def.shape();
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
    name: ("state" in it && it.state.name) ? it.state.name : "undefined",
    in: "path",
    required: true,
    description: ("state" in it) ? it.state.description : undefined,
    schema: mapSchema(it),
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
    schema: mapSchema(it[key]),
  }));
}

function createResponsesObject(
  responses: HttpResponses,
): Record<number, ResponseObject> {
  if ("options" in responses) {
    return responses.options.reduce((acc, cur) => ({
      ...acc,
      ...createResponseObject(cur),
    }), {});
  }
  if ("shape" in responses) {
    return createResponseObject(responses);
  }
  return {};
}

function mapResponsesObject(responses: HttpResponses): HttpResponse[] {
  if ("options" in responses) {
    return responses.options.map((it) => it);
  }
  if ("shape" in responses) {
    return [responses];
  }
  return [];
}

function createResponseObject(
  response: HttpResponse,
): Record<number | string, ResponseObject> {
  const shape = response._def.shape();
  const name = ("value" in shape.status._def)
    ? shape.status._def?.value
    : "default";
  return {
    [name]: {
      description: shape.description._def.value,
      headers: createHeadersObject(shape.headers),
      content: ("reference" in shape.content || "component" in shape.content)
        ? {
          "application/json": {
            schema: createSchema(shape.content),
          },
        }
        : undefined,
    },
  };
}

function createHeadersObject(headers: Headers): HeadersObject | undefined {
  const shape = headers._def.shape();

  if (Object.keys(shape).length === 0) {
    return undefined;
  }

  return Object.keys(shape).reduce((acc, cur) => {
    const obj = shape[cur];
    if ("value" in obj._def) {
      return ({
        ...acc,
        [cur]: {
          "schema": mapSchema(obj),
        },
      });
    }
    if ("options" in obj) {
      return ({
        ...acc,
        [cur]: {
          "schema": obj.options.map((it) => it._def.value),
        },
      });
    }
    if ("state" in obj) {
      return ({
        ...acc,
        [cur]: {
          description: obj.state.description,
          "schema": mapSchema(obj),
        },
      });
    }
    return ({
      ...acc,
      [cur]: {},
    });
  }, {});
}

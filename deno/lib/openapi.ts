import {
  Component,
  ComponentType,
  Parameter,
  Reference,
  ReferenceType,
  ZodFirstPartyTypeKind,
  ZodLiteral,
  ZodOptional,
  ZodString,
  ZodTypeAny,
} from "./index.ts";
import {
  HttpBodyUnion,
  HttpObject,
  HttpResponseObject,
  HttpResponseUnion,
  HttpSchema,
  ParameterObject as ParameterObj,
} from "./model.ts";
import {
  ComponentsObject,
  ContentObject,
  HeadersObject,
  InfoObject,
  OpenAPIObject,
  OperationObject,
  ParameterObject,
  PathsObject,
  ReferenceObject,
  RequestBodyObject,
  ResponseObject,
  ResponsesObject,
  SchemaObject,
  ServerObject,
} from "./utils/openapi3-ts/OpenApi.ts";

const base = {
  openapi: "3.0.0",
};

function mapSchema(type: ComponentType): SchemaObject | undefined {
  switch (type._def.typeName) {
    case ZodFirstPartyTypeKind.ZodNumber:
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
    case ZodFirstPartyTypeKind.ZodBigInt:
      return {
        type: "integer",
        format: "int32",
      };
    case ZodFirstPartyTypeKind.ZodString:
      return {
        type: "string",
      };
    default:
      return undefined;
  }
}

export function createSchema(
  obj: ReferenceType | Reference<any> | Component<any>
): SchemaObject | ReferenceObject | undefined {
  if ("reference" in obj) {
    return { $ref: `#/components/schemas/${obj.state.name}` };
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
        if (shape[cur]._def.typeName !== ZodFirstPartyTypeKind.ZodOptional) {
          return [...acc, cur];
        }
        return acc;
      }, []),
    };
  }
  if ("checks" in obj._def) {
    return mapSchema(obj);
  }
  return undefined;
}

export function openApi(
  schema: HttpSchema,
  info: InfoObject = { title: "No title", version: "1.0.0" },
  servers: ServerObject[] = []
): OpenAPIObject {
  const options = "options" in schema ? schema.options : [schema];
  const paths = createPaths(options);
  const components = createComponents(options);
  return { ...base, info, servers, paths, components };
}

function createPaths(options: HttpObject[]): PathsObject {
  return options.reduce<PathsObject>((acc, cur) => {
    const shape = cur._def.shape();
    const method = shape.method._def.value;
    const path =
      shape.path._def !== undefined && "items" in shape.path._def
        ? "/" +
          shape.path._def.items
            .map((p) => {
              if ("state" in p) {
                return `{${p.state.name}}`;
              }
              if (p._def.typeName === ZodFirstPartyTypeKind.ZodString) {
                return `{${p._def.typeName}}`;
              }
              if (p._def.typeName === ZodFirstPartyTypeKind.ZodLiteral) {
                return p._def.value;
              }
            })
            .join("/")
        : "/";
    return {
      ...acc,
      [path]: {
        ...acc[path],
        [method.toLowerCase()]: createOperationObject(cur),
      },
    };
  }, {});
}

function createComponents(options: HttpObject[]): ComponentsObject | undefined {
  const schemas = options
    .flatMap((http) => {
      return mapResponsesObject(http.shape.responses);
    })
    .map((response) => {
      const body = response.shape.body;
      if ("shape" in body) {
        return body.shape.content;
      }
      if ("options" in body) {
        body.options.map((it) => it.shape.content);
      }
      return undefined;
    })
    .reduce((acc, cur) => {
      if (cur != null && "reference" in cur && cur.state.name) {
        return { ...acc, [cur.state.name]: createSchema(cur.reference) };
      } else {
        return acc;
      }
    }, {});
  return Object.keys(schemas).length > 0
    ? {
        schemas: schemas,
      }
    : undefined;
}

function createOperationObject(http: HttpObject): OperationObject {
  const shape = http._def.shape();
  return {
    summary:
      "defaultValue" in shape.summary._def
        ? shape.summary._def.defaultValue()
        : undefined,
    operationId:
      "defaultValue" in shape.name._def
        ? shape.name._def.defaultValue()
        : undefined,
    tags:
      "defaultValue" in shape.tags._def
        ? (shape.tags._def.defaultValue() as string[])
        : undefined,
    requestBody: createRequestBody(http),
    parameters: createParameterObject(http),
    responses: createResponsesObject(shape.responses),
  };
}

function createRequestBody(
  http: HttpObject
): RequestBodyObject | ReferenceObject | undefined {
  const shape = http._def.shape();
  const content = createContentObject(shape.body);
  return content ? { content } : undefined;
}

function createParameterObject(http: HttpObject) {
  const shape = http._def.shape();
  const res = [
    ...("shape" in shape.query._def
      ? createQueryParameterObject(shape.query._def.shape())
      : []),
    ...(shape.path._def && "items" in shape.path._def
      ? shape.path._def.items
          .filter((it) => "state" in it)
          .map(createPathParameterObject)
      : []),
  ];
  return res.length > 0 ? res : undefined;
}

function createPathParameterObject(
  it: ZodLiteral<any> | ZodString | ZodOptional<ZodTypeAny> | Parameter
): ParameterObject {
  return {
    name: "state" in it && it.state.name ? it.state.name : "undefined",
    in: "path",
    description: "state" in it ? it.state.description : undefined,
    required: !("innerType" in it._def),
    schema:
      "innerType" in it._def ? mapSchema(it._def.innerType) : mapSchema(it),
  };
}

function createQueryParameterObject(
  it: Record<PropertyKey, Parameter>
): ParameterObject[] {
  return Object.keys(it).map((key) => ({
    name: key,
    in: "query",
    description: "state" in it[key] ? it[key].state.description : undefined,
    required: !("innerType" in it[key]._def),
    // @ts-ignore
    schema:
      "innerType" in it[key]._def
        ? // @ts-ignore
          mapSchema(it[key]._def.innerType)
        : mapSchema(it[key]),
  }));
}

function createResponsesObject(responses: HttpResponseUnion): ResponsesObject {
  if ("shape" in responses) {
    return createResponseObject(responses);
  }
  if ("options" in responses) {
    return responses.options.reduce<ResponsesObject>((acc, cur) => {
      return {
        ...acc,
        ...createResponseObject(cur),
      };
    }, {});
  }
  return {};
}

function mapResponsesObject(
  responses: HttpResponseUnion
): HttpResponseObject[] {
  if ("options" in responses) {
    return responses.options.map((it) => it);
  }
  if ("shape" in responses) {
    return [responses];
  }
  return [];
}

function createResponseObject(
  response: HttpResponseObject
): Record<string, ResponseObject> {
  const shape = response._def.shape();
  const name = shape.status._def.value as string;
  return {
    [name]: {
      description:
        "value" in shape.description._def ? shape.description._def.value : "",
      headers:
        "shape" in shape.headers
          ? createHeadersObject(shape.headers)
          : undefined,
      content: createContentObject(shape.body),
    },
  };
}
function createContentObject(body: HttpBodyUnion): ContentObject | undefined {
  if ("shape" in body) {
    return {
      [body.shape.type._def.value]: {
        schema: createSchema(body.shape.content),
      },
    };
  }
  if ("options" in body) {
    return body.options.reduce(
      (acc, cur) => ({ ...acc, ...createContentObject(cur) }),
      {}
    );
  }
  return undefined;
}

function createHeadersObject(headers: ParameterObj): HeadersObject | undefined {
  const shape = headers._def.shape();

  if (Object.keys(shape).length === 0) {
    return undefined;
  }

  return Object.keys(shape).reduce((acc, cur) => {
    const obj = shape[cur];
    if ("value" in obj._def) {
      return {
        ...acc,
        [cur]: {
          schema: mapSchema(obj),
        },
      };
    }
    if ("state" in obj) {
      return {
        ...acc,
        [cur]: {
          description: obj.state.description,
          schema: mapSchema(obj),
        },
      };
    }
    return {
      ...acc,
      [cur]: {},
    };
  }, {});
}

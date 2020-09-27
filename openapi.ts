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
    ZodOptional,
    ZodString,
    ZodTransformer,
    ZodTuple,
    ZodTypes,
    ZodUndefined,
    ZodUnion,
} from "./deps.ts";

import {Component, Parameter} from "./lib/index.ts";

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

export type Headers = ZodObject<{[key:string]: ZodLiteral<string> | ZodUnion<[ZodLiteral<string>, ZodLiteral<string>, ...ZodLiteral<string>[]]> | Parameter}>

export type HttpResponse = ZodObject<{
    status: ZodLiteral<number | string> | ZodUndefined;
    description: ZodLiteral<string>;
    headers: Headers;
    content: Component | ZodUndefined;
}>

export type Http = {
    name: ZodTransformer<ZodOptional<ZodLiteral<any>>, ZodLiteral<string>>,
    method: ZodLiteral<string>;
    path: ZodTuple<[
            ZodLiteral<any> | ZodString | Parameter,
        ...(ZodLiteral<any> | ZodString | Parameter)[],
    ]>;
    summary: ZodLiteral<string> | ZodUndefined;
    tags: ZodTuple<[ZodLiteral<string>, ...ZodLiteral<string>[]]> | ZodUndefined;
    query:ZodObject<{[key:string]: Parameter}>
    headers: Headers;
    responses:
        | HttpResponse
        | ZodUnion<[HttpResponse, HttpResponse, ...HttpResponse[]]>;
};
export type HttpObject = ZodObject<Http>
export type HttpUnion = ZodUnion<[HttpObject, HttpObject, ...HttpObject[]]>;

export function openApi(
    schema: HttpObject | HttpUnion,
    servers: ServerObject[] = [],
): OpenAPIObject {
    const options = ("options" in schema) ? schema.options : [schema]
    const paths: PathsObject = options
        .reduce<PathsObject>(
            (acc, cur) => {
                const shape = cur._def.shape()
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

    return {...base, servers, paths};
}

function createOperationObject(http: HttpObject): OperationObject {
    const shape = http._def.shape()
    return {
        summary: ("value" in shape.summary._def)
            ? shape.summary._def.value
            : undefined,
        operationId: shape.name._def.output._def.value,
        tags: ("items" in shape.tags._def)
            ? shape.tags._def.items
                .map((x) => ("value" in x._def) ? x._def.value : undefined)
            : undefined,
        parameters: createParameterObject(http),
        responses: createResponsesObject(shape.responses),
    };
}

function createParameterObject(http: HttpObject) {
    const shape = http._def.shape()
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
        | HttpResponse
        | ZodUnion<[HttpResponse, HttpResponse, ...HttpResponse[]]>
        | ZodUndefined,
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

function createResponseObject(
    response: HttpResponse,
): Record<number | string, ResponseObject> {
    const shape = response._def.shape()
    const name = ("value" in shape.status._def)
        ? shape.status._def?.value
        : "default";
    return {
        [name]: {
            description: shape.description._def.value,
            headers: createHeadersObject(shape.headers),
            content: ("state" in shape.content)
                ? {
                    "application/json": {
                        schema: {
                            $ref: "#/components/schemas/" + shape.content.state.name,
                        },
                    },
                }
                : undefined,
        },
    };
}

function createHeadersObject(headers: Headers): HeadersObject| undefined {

    const shape = headers._def.shape()

    if(Object.keys(shape).length === 0){
        return undefined
    }

    return Object.keys(shape).reduce((acc, cur) => {
        const obj = shape[cur]
        if("value" in obj._def){
            return ({
                ...acc,
                [cur]: {
                    "schema": mapSchema(obj._def.value),
                },
            })
        }
        if('options' in obj){
            return ({
                ...acc,
                [cur]: {
                    "schema": obj.options.map(it=> it._def.value),
                },
            })
        }
        if('state' in obj){
            return ({
                ...acc,
                [cur]: {
                    description: obj.state.description,
                    "schema": mapSchema(obj.state.type._def.t),
                },
            })
        }
        return ({
            ...acc,
            [cur]: {}
        })
    }, {});
}

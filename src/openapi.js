"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openApi = exports.createSchema = void 0;
var index_1 = require("./index");
var base = {
    openapi: "3.0.0",
};
function mapSchema(type) {
    switch (type._def.typeName) {
        case index_1.ZodFirstPartyTypeKind.ZodNumber:
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
        case index_1.ZodFirstPartyTypeKind.ZodBigInt:
            return {
                type: "integer",
                format: "int32",
            };
        case index_1.ZodFirstPartyTypeKind.ZodString:
            return {
                type: "string",
            };
        default:
            return undefined;
    }
}
function createSchema(obj) {
    if ("reference" in obj) {
        return { $ref: "#/components/schemas/" + obj.state.name };
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
        var shape_1 = obj._def.shape();
        return {
            type: "object",
            properties: Object.keys(shape_1).reduce(function (acc, cur) {
                var _a;
                return __assign(__assign({}, acc), (_a = {}, _a[cur] = createSchema(shape_1[cur]), _a));
            }, {}),
            required: Object.keys(shape_1).reduce(function (acc, cur) {
                if (shape_1[cur]._def.typeName !== index_1.ZodFirstPartyTypeKind.ZodOptional) {
                    return __spreadArray(__spreadArray([], __read(acc)), [cur]);
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
exports.createSchema = createSchema;
function openApi(schema, info, servers) {
    if (info === void 0) { info = { title: "No title", version: "1.0.0" }; }
    if (servers === void 0) { servers = []; }
    var options = "options" in schema ? schema.options : [schema];
    var paths = createPaths(options);
    var components = createComponents(options);
    return __assign(__assign({}, base), { info: info, servers: servers, paths: paths, components: components });
}
exports.openApi = openApi;
function createPaths(options) {
    return options.reduce(function (acc, cur) {
        var _a, _b;
        var shape = cur._def.shape();
        var method = shape.method._def.value;
        var path = shape.path._def !== undefined && "items" in shape.path._def
            ? "/" +
                shape.path._def.items
                    .map(function (p) {
                    if ("state" in p) {
                        return "{" + p.state.name + "}";
                    }
                    if (p._def.typeName === index_1.ZodFirstPartyTypeKind.ZodString) {
                        return "{" + p._def.typeName + "}";
                    }
                    if (p._def.typeName === index_1.ZodFirstPartyTypeKind.ZodLiteral) {
                        return p._def.value;
                    }
                })
                    .join("/")
            : "/";
        return __assign(__assign({}, acc), (_a = {}, _a[path] = __assign(__assign({}, acc[path]), (_b = {}, _b[method.toLowerCase()] = createOperationObject(cur), _b)), _a));
    }, {});
}
function createComponents(options) {
    var schemas = options
        .flatMap(function (http) {
        return mapResponsesObject(http.shape.responses);
    })
        .map(function (response) {
        var body = response.shape.body;
        if ("shape" in body) {
            return body.shape.content;
        }
        if ("options" in body) {
            body.options.map(function (it) { return it.shape.content; });
        }
        return undefined;
    })
        .reduce(function (acc, cur) {
        var _a;
        if (cur != null && "reference" in cur && cur.state.name) {
            return __assign(__assign({}, acc), (_a = {}, _a[cur.state.name] = createSchema(cur.reference), _a));
        }
        else {
            return acc;
        }
    }, {});
    return Object.keys(schemas).length > 0
        ? {
            schemas: schemas,
        }
        : undefined;
}
function createOperationObject(http) {
    var shape = http._def.shape();
    return {
        summary: "defaultValue" in shape.summary._def
            ? shape.summary._def.defaultValue()
            : undefined,
        operationId: "defaultValue" in shape.name._def
            ? shape.name._def.defaultValue()
            : undefined,
        tags: "defaultValue" in shape.tags._def
            ? shape.tags._def.defaultValue()
            : undefined,
        requestBody: createRequestBody(http),
        parameters: createParameterObject(http),
        responses: createResponsesObject(shape.responses),
    };
}
function createRequestBody(http) {
    var shape = http._def.shape();
    var content = createContentObject(shape.body);
    return content ? { content: content } : undefined;
}
function createParameterObject(http) {
    var shape = http._def.shape();
    var res = __spreadArray(__spreadArray([], __read(("shape" in shape.query._def
        ? createQueryParameterObject(shape.query._def.shape())
        : []))), __read((shape.path._def && "items" in shape.path._def
        ? shape.path._def.items
            .filter(function (it) { return "state" in it; })
            .map(createPathParameterObject)
        : [])));
    return res.length > 0 ? res : undefined;
}
function createPathParameterObject(it) {
    return {
        name: "state" in it && it.state.name ? it.state.name : "undefined",
        in: "path",
        description: "state" in it ? it.state.description : undefined,
        required: !("innerType" in it._def),
        schema: "innerType" in it._def ? mapSchema(it._def.innerType) : mapSchema(it),
    };
}
function createQueryParameterObject(it) {
    return Object.keys(it).map(function (key) { return ({
        name: key,
        in: "query",
        description: "state" in it[key] ? it[key].state.description : undefined,
        required: !("innerType" in it[key]._def),
        // @ts-ignore
        schema: "innerType" in it[key]._def
            ? // @ts-ignore
                mapSchema(it[key]._def.innerType)
            : mapSchema(it[key]),
    }); });
}
function createResponsesObject(responses) {
    if ("shape" in responses) {
        return createResponseObject(responses);
    }
    if ("options" in responses) {
        return responses.options.reduce(function (acc, cur) {
            return __assign(__assign({}, acc), createResponseObject(cur));
        }, {});
    }
    return {};
}
function mapResponsesObject(responses) {
    if ("options" in responses) {
        return responses.options.map(function (it) { return it; });
    }
    if ("shape" in responses) {
        return [responses];
    }
    return [];
}
function createResponseObject(response) {
    var _a;
    var shape = response._def.shape();
    var name = shape.status._def.value;
    return _a = {},
        _a[name] = {
            description: "value" in shape.description._def ? shape.description._def.value : "",
            headers: "shape" in shape.headers
                ? createHeadersObject(shape.headers)
                : undefined,
            content: createContentObject(shape.body),
        },
        _a;
}
function createContentObject(body) {
    var _a;
    if ("shape" in body) {
        return _a = {},
            _a[body.shape.type._def.value] = {
                schema: createSchema(body.shape.content),
            },
            _a;
    }
    if ("options" in body) {
        return body.options.reduce(function (acc, cur) { return (__assign(__assign({}, acc), createContentObject(cur))); }, {});
    }
    return undefined;
}
function createHeadersObject(headers) {
    var shape = headers._def.shape();
    if (Object.keys(shape).length === 0) {
        return undefined;
    }
    return Object.keys(shape).reduce(function (acc, cur) {
        var _a, _b, _c;
        var obj = shape[cur];
        if ("value" in obj._def) {
            return __assign(__assign({}, acc), (_a = {}, _a[cur] = {
                schema: mapSchema(obj),
            }, _a));
        }
        if ("state" in obj) {
            return __assign(__assign({}, acc), (_b = {}, _b[cur] = {
                description: obj.state.description,
                schema: mapSchema(obj),
            }, _b));
        }
        return __assign(__assign({}, acc), (_c = {}, _c[cur] = {}, _c));
    }, {});
}

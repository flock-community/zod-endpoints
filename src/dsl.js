"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.response = exports.body = exports.endpoint = exports.endpoints = void 0;
var z = __importStar(require("./deps"));
function endpoints(types) {
    // @ts-ignore
    return types.length === 1 ? types[0] : z.union(types);
}
exports.endpoints = endpoints;
function endpoint(endpoint) {
    // @ts-ignore
    return z.object({
        name: z.literal(endpoint.name).default(endpoint.name),
        summary: endpoint.summary !== undefined
            ? z.literal(endpoint.summary).default(endpoint.summary)
            : z.undefined(),
        tags: endpoint.tags !== undefined
            ? // @ts-ignore
                z.tuple(endpoint.tags).default(endpoint.tags.map(function (_) { return _._def.value; }))
            : z.undefined(),
        method: z.literal(endpoint.method),
        // @ts-ignore
        path: endpoint.path !== undefined ? z.tuple(endpoint.path) : [],
        query: endpoint.query !== undefined
            ? z.object(endpoint.query)
            : z.object({}),
        headers: endpoint.headers !== undefined
            ? z.object(endpoint.headers)
            : z.object({}),
        // @ts-ignore
        body: transformBody(endpoint.body),
        // @ts-ignore
        responses: endpoint.responses !== undefined
            ? // @ts-ignore
                z.union(endpoint.responses)
            : z.undefined(),
    });
}
exports.endpoint = endpoint;
function body(body) {
    return z.object({
        type: z.literal(body.type),
        content: body.content,
    });
}
exports.body = body;
function response(response) {
    // @ts-ignore
    return z.object({
        status: z.literal(response.status),
        description: z.literal(response.description),
        headers: response.headers !== undefined
            ? z.object(response.headers)
            : z.undefined(),
        body: transformBody(response.body),
    });
}
exports.response = response;
function transformBody(body) {
    if (body === undefined) {
        return z.undefined();
    }
    if (Array.isArray(body)) {
        if (body.length === 1) {
            return body[0];
        }
        // @ts-ignore
        return z.union(body);
    }
    return body;
}

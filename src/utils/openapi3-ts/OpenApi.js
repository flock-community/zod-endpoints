"use strict";
// Typed interfaces for OpenAPI 3.0.0-RC
// see https://github.com/OAI/OpenAPI-Specification/blob/3.0.0-rc0/versions/3.0.md
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSchemaObject = exports.isReferenceObject = exports.getPath = exports.addExtension = exports.getExtension = void 0;
var SpecificationExtension_1 = require("./SpecificationExtension");
function getExtension(obj, extensionName) {
    if (SpecificationExtension_1.SpecificationExtension.isValidExtension(extensionName)) {
        return obj[extensionName];
    }
    return undefined;
}
exports.getExtension = getExtension;
function addExtension(obj, extensionName, extension) {
    if (SpecificationExtension_1.SpecificationExtension.isValidExtension(extensionName)) {
        obj[extensionName] = extension;
    }
}
exports.addExtension = addExtension;
function getPath(pathsObject, path) {
    if (SpecificationExtension_1.SpecificationExtension.isValidExtension(path)) {
        return undefined;
    }
    return pathsObject[path];
}
exports.getPath = getPath;
/**
 * A type guard to check if the given value is a `ReferenceObject`.
 * See https://www.typescriptlang.org/docs/handbook/advanced-types.html#type-guards-and-differentiating-types
 *
 * @param obj The value to check.
 */
function isReferenceObject(obj) {
    /* eslint-disable-next-line no-prototype-builtins */
    return obj.hasOwnProperty("$ref");
}
exports.isReferenceObject = isReferenceObject;
/**
 * A type guard to check if the given object is a `SchemaObject`.
 * Useful to distinguish from `ReferenceObject` values that can be used
 * in most places where `SchemaObject` is allowed.
 *
 * See https://www.typescriptlang.org/docs/handbook/advanced-types.html#type-guards-and-differentiating-types
 *
 * @param schema The value to check.
 */
function isSchemaObject(schema) {
    /* eslint-disable-next-line no-prototype-builtins */
    return !schema.hasOwnProperty("$ref");
}
exports.isSchemaObject = isSchemaObject;

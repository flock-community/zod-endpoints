"use strict";
// Suport for Specification Extensions
// as described in
// https://github.com/OAI/OpenAPI-Specification/blob/3.0.0-rc0/versions/3.0.md#specificationExtensions
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpecificationExtension = void 0;
var SpecificationExtension = /** @class */ (function () {
    function SpecificationExtension() {
    }
    SpecificationExtension.isValidExtension = function (extensionName) {
        return /^x\-/.test(extensionName);
    };
    SpecificationExtension.prototype.getExtension = function (extensionName) {
        if (!SpecificationExtension.isValidExtension(extensionName)) {
            throw new Error("Invalid specification extension: '" +
                extensionName +
                "'. Extensions must start with prefix 'x-");
        }
        if (this[extensionName]) {
            return this[extensionName];
        }
        return null;
    };
    SpecificationExtension.prototype.addExtension = function (extensionName, payload) {
        if (!SpecificationExtension.isValidExtension(extensionName)) {
            throw new Error("Invalid specification extension: '" +
                extensionName +
                "'. Extensions must start with prefix 'x-");
        }
        this[extensionName] = payload;
    };
    SpecificationExtension.prototype.listExtensions = function () {
        var res = [];
        for (var propName in this) {
            /* eslint-disable-next-line no-prototype-builtins */
            if (this.hasOwnProperty(propName)) {
                if (SpecificationExtension.isValidExtension(propName)) {
                    res.push(propName);
                }
            }
        }
        return res;
    };
    return SpecificationExtension;
}());
exports.SpecificationExtension = SpecificationExtension;

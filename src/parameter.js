"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.parameter = exports.Parameter = void 0;
var z = __importStar(require("./deps"));
var Parameter = /** @class */ (function (_super) {
    __extends(Parameter, _super);
    function Parameter(type) {
        var _this = _super.call(this, type._def) || this;
        _this.toJSON = function () { return _this._def; };
        _this.type = type;
        _this.state = {
            name: undefined,
            description: undefined,
        };
        return _this;
    }
    Parameter.prototype._parse = function (_ctx, _data, _parsedType) {
        return this.type._parse(_ctx, _data, _parsedType);
    };
    Parameter.prototype.name = function (name) {
        this.state = __assign(__assign({}, this.state), { name: name });
        return this;
    };
    Parameter.prototype.description = function (description) {
        this.state = __assign(__assign({}, this.state), { description: description });
        return this;
    };
    Parameter.create = function (type) {
        return new Parameter(type);
    };
    return Parameter;
}(z.ZodType));
exports.Parameter = Parameter;
exports.parameter = Parameter.create;

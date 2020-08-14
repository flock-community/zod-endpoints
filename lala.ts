import {literal} from './deps.ts
import {ZodLiteral} from "./deps.ts";
import {ZodUndefined} from "./deps.ts";
import {ZodObject} from "./deps.ts";
import {Component} from "./lib";

literal("TEST")



type X = {
    x: ZodLiteral<number | string>
};
type HttpResponseObject = ZodObject<
    X,
    any,
    objectUtil.Flatten<objectUtil.ObjectType<X>>
    >;

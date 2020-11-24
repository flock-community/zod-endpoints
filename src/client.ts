import * as z from "./index";
import {PickUnion} from "./utils";


type Request<T extends z.HttpSchema> = PickUnion<z.output<T>, "method" | "path" | "query" | "headers" | "body">
type RequestResponses<T extends z.HttpSchema> = PickUnion<z.output<T>, "method" | "path" | "query" | "headers" | "body" | "responses">
type Match<T extends z.HttpSchema, R extends Request<T>> = Extract<RequestResponses<T>, { method: R['method'], path: R['path'] }>['responses']

export type Client<T extends z.HttpSchema> = Request<T> extends infer R ? (req: R) => Match<T, Request<T>> : never

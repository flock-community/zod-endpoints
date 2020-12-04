import * as z from "./index";
import {PickUnion} from "./utils";

type ClientRequestAttributes = "method" | "path" | "query" | "headers" | "body"
type ClientRequest<T extends z.HttpSchema> = PickUnion<z.output<T>, ClientRequestAttributes>
type ClientRequestResponses<T extends z.HttpSchema> = PickUnion<z.output<T>, ClientRequestAttributes | "responses">
type ClientMatch<T extends z.HttpSchema, R extends ClientRequest<T>> = Extract<ClientRequestResponses<T>, { method: R['method'], path: R['path'] }>['responses']

export type Client<T extends z.HttpSchema> = <R extends ClientRequest<T>>(req: R) => Promise<ClientMatch<T, R>>;

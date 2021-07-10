import * as z from "./deps.ts";
import { HttpSchema } from "./model.ts";
import { PickUnion } from "./utils.ts";

type ClientRequestAttributes = "method" | "path" | "query" | "headers" | "body";
type ClientResponseAttributes = "status" | "headers" | "body";
type ClientRequest<T extends HttpSchema> = PickUnion<
  z.output<T>,
  ClientRequestAttributes
>;
type ClientRequestResponses<T extends HttpSchema> = PickUnion<
  z.output<T>,
  ClientRequestAttributes | "responses"
>;
type ClientMapper<
  T extends HttpSchema,
  R extends ClientRequest<T>
> = NonNullable<{
  method: R["method"];
  path: R["path"];
  query: R["query"];
  headers: R["headers"];
  body?: R["body"];
}>;
type ClientMatch<T extends HttpSchema, R extends ClientRequest<T>> = Extract<
  ClientRequestResponses<T>,
  ClientMapper<T, R>
>["responses"];

export type Client<T extends HttpSchema> = <R extends ClientRequest<T>>(
  req: R
) => Promise<
  ClientResponseAttributes extends keyof ClientMatch<T, R>
    ? PickUnion<ClientMatch<T, R>, ClientResponseAttributes>
    : undefined
>;

import * as z from "./deps";
import {HttpSchema} from "./model";

export type ApiNames<T extends HttpSchema> = z.output<T> extends {
  name: string;
}
  ? z.output<T>["name"]
  : never;

type PickU<T, K extends keyof T> = T extends any ? {[P in K]: T[P]} : never;
export type ApiRequest<T extends HttpSchema, Key> = Extract<z.output<T>, { name: Key }>;
export type ApiResponse<T extends HttpSchema, Key> = ApiRequest<T, Key>["responses"]
export type ApiFunction<T extends HttpSchema, Key> = (
  request: PickU<ApiRequest<T, Key>, "method" | "path" |  "query" | "headers" | "body">
) => Promise<PickU<ApiResponse<T, Key>,"status" | "headers" | "body">>;

export type Api<T extends HttpSchema> = {
  [Key in ApiNames<T>]: ApiFunction<T, Key>;
};

export type ApiFragment<
  T extends HttpSchema,
  Key extends ApiNames<T>
> = Pick<Api<T>, Key>;

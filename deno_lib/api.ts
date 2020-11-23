import * as z from "./deps.ts";
import {HttpSchema} from "./model.ts";

export type ApiNames<T extends HttpSchema> = z.output<T> extends {
  name: string;
}
  ? z.output<T>["name"]
  : never;
export type ApiRequest<T extends HttpSchema, Key> = Pick<
  Extract<z.output<T>, { name: Key }>,
  "method" | "path" |  "query" | "headers" | "body"
>;
export type ApiResponse<T extends HttpSchema, Key> = Pick<
  Extract<z.output<T>, { name: Key }>["responses"],
  "status" | "headers" | "body"
>;
export type ApiFunction<T extends HttpSchema, Key> = (
  request: ApiRequest<T, Key>
) => Promise<ApiResponse<T, Key>>;

export type Api<T extends HttpSchema> = {
  [Key in ApiNames<T>]: ApiFunction<T, Key>;
};
export type ApiFragment<
  T extends HttpSchema,
  Key extends ApiNames<T>
> = Pick<Api<T>, Key>;

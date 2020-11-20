import * as z from "./deps.ts";
import { HttpSchema } from "./model.ts";

export type ApiRouteNames<T extends HttpSchema> = z.output<T> extends {
  name: string;
}
  ? z.output<T>["name"]
  : never;
export type ApiRequest<T extends HttpSchema, Key> = Pick<
  Extract<z.output<T>, { name: Key }>,
  "method" | "path" | "headers" | "body"
>;
export type ApiResponse<T extends HttpSchema, Key> = Pick<
  Extract<z.output<T>, { name: Key }>["responses"],
  "status" | "headers" | "body"
>;
export type ApiRouteFunction<T extends HttpSchema, Key> = (
  request: ApiRequest<T, Key>
) => Promise<ApiResponse<T, Key>>;

export type Api<T extends HttpSchema> = {
  [Key in ApiRouteNames<T>]: ApiRouteFunction<T, Key>;
};
export type ApiFragment<
  T extends HttpSchema,
  Key extends ApiRouteNames<T>
> = Pick<Api<T>, Key>;

import * as z from "./deps";
import {HttpSchema} from "./model";

export type ApiNames<T extends HttpSchema> = z.output<T> extends {
  name: string;
}
  ? z.output<T>["name"]
  : never;
export type ApiRequest<T extends HttpSchema> = Pick<
  Extract<z.output<T>, { name: ApiNames<T> }>,
  "method" | "path" |  "query" | "headers" | "body"
>;
export type ApiResponse<T extends HttpSchema> = Pick<
  Extract<z.output<T>, { name: ApiNames<T> }>["responses"],
  "status" | "headers" | "body"
>;
export type ApiFunction<T extends HttpSchema> = (
  request: ApiRequest<T>
) => Promise<ApiResponse<T>>;

export type Api<T extends HttpSchema> = {
  [Key in ApiNames<T>]: ApiFunction<T>;
};
export type ApiFragment<
  T extends HttpSchema,
  Key extends ApiNames<T>
> = Pick<Api<T>, Key>;

import * as z from "./deps";
import { HttpSchema } from "./model";
import { PickUnion } from "./utils";

export type ApiNames<T extends HttpSchema> = z.output<T> extends {
  name: string;
}
  ? z.output<T>["name"]
  : never;

export type ApiRequestAttributes =
  | "method"
  | "path"
  | "query"
  | "headers"
  | "body";
export type ApiResponseAttributes = "status" | "headers" | "body";
export type ApiRequest<T extends HttpSchema, Key> = Extract<
  z.output<T>,
  { name: Key }
>;
export type ApiResponse<T extends HttpSchema, Key> = ApiRequest<
  T,
  Key
>["responses"];
export type ApiFunction<T extends HttpSchema, Key> = (
  request: Readonly<PickUnion<ApiRequest<T, Key>, ApiRequestAttributes>>
) => Readonly<
  Promise<
    ApiResponseAttributes extends keyof ApiResponse<T, Key>
      ? PickUnion<ApiResponse<T, Key>, ApiResponseAttributes>
      : undefined
  >
>;

export type Api<T extends HttpSchema> = {
  [Key in ApiNames<T>]: ApiFunction<T, Key>;
};

export type ApiFragment<T extends HttpSchema, Key extends ApiNames<T>> = Pick<
  Api<T>,
  Key
>;

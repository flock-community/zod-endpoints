import * as z from "./index";
import { PickUnion } from "./utils";

export type ApiNames<T extends z.HttpSchema> = z.output<T> extends {
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
export type ApiRequest<T extends z.HttpSchema, Key> = Extract<
  z.output<T>,
  { name: Key }
>;
export type ApiResponse<T extends z.HttpSchema, Key> = ApiRequest<
  T,
  Key
>["responses"];
export type ApiFunction<T extends z.HttpSchema, Key> = (
  request: Readonly<PickUnion<ApiRequest<T, Key>, ApiRequestAttributes>>
) => Readonly<
  Promise<
    ApiResponseAttributes extends keyof ApiResponse<T, Key>
      ? PickUnion<ApiResponse<T, Key>, ApiResponseAttributes>
      : undefined
  >
>;

export type Api<T extends z.HttpSchema> = {
  [Key in ApiNames<T>]: ApiFunction<T, Key>;
};

export type ApiFragment<T extends z.HttpSchema, Key extends ApiNames<T>> = Pick<
  Api<T>,
  Key
>;

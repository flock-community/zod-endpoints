import * as z from "./index.ts";
import {PickUnion} from "./utils.ts";

export type ApiNames<T extends z.HttpSchema> = z.output<T> extends {
  name: string;
}
  ? z.output<T>["name"]
  : never;


export type ApiRequest<T extends z.HttpSchema, Key> = Extract<z.output<T>, { name: Key }>;
export type ApiResponse<T extends z.HttpSchema, Key> = ApiRequest<T, Key>["responses"]
export type ApiFunction<T extends z.HttpSchema, Key> = (
  request: PickUnion<ApiRequest<T, Key>, "method" | "path" |  "query" | "headers" | "body">
) => Promise<PickUnion<ApiResponse<T, Key>,"status" | "headers" | "body">>;

export type Api<T extends z.HttpSchema> = {
  [Key in ApiNames<T>]: ApiFunction<T, Key>;
};

export type ApiFragment<
  T extends z.HttpSchema,
  Key extends ApiNames<T>
> = Pick<Api<T>, Key>;

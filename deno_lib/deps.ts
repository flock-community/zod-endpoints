import { ZodTypeAny } from "https://raw.githubusercontent.com/flock-community/zod/v2_deno/deno_lib/index.ts";

export * from "https://raw.githubusercontent.com/flock-community/zod/v2_deno/deno_lib/index.ts";

export type ZodRawShape = {
  [k: string]: ZodTypeAny;
};

export namespace errorUtil {
  export type ErrMessage = string | { message?: string };
  export const errToObj = (message?: ErrMessage) =>
    typeof message === "string" ? { message } : message || {};
}

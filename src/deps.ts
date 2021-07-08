import { ZodTypeAny } from "zod";

export *  from "zod";

export type ZodRawShape = {
  [k: string]: ZodTypeAny;
};

export namespace errorUtil {
  export type ErrMessage = string | { message?: string };
  export const errToObj = (message?: ErrMessage) =>
    typeof message === "string" ? { message } : message || {};
}

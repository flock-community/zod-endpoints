import {ZodTypeAny} from "zod";

export * from "zod";
// export {
//   ZodUnion,
//   ZodUnionDef,
// } from "zod/lib/cjs/types/union";
// export {
//   ZodTuple,
//   OutputTypeOfTuple,
// } from "zod/lib/cjs/types/tuple";

// export declare type ZodTypeAny = z.ZodType<any, any, any>;
export type ZodRawShape = {
  [k: string]: ZodTypeAny;
};

export namespace errorUtil {
  export type ErrMessage = string | { message?: string };
  export const errToObj = (message?: ErrMessage) =>
      typeof message === 'string' ? { message } : message || {};
}

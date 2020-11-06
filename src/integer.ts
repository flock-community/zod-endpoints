import * as z from "./deps";
import { errorUtil } from "./deps";

export interface IntegerDef extends z.ZodTypeDef {
  t: z.ZodTypes.number;
  format: string;
}

export class Integer extends z.ZodType<number, IntegerDef> {
  public toJSON = () => this._def;

  static create = (format?: string): Integer => {
    return new Integer({
      t: z.ZodTypes.number,
      format: format ?? "int32",
    });
  };

  min = (minimum: number, message?: errorUtil.ErrMessage) =>
    this.refinement((data) => data >= minimum, {
      code: z.ZodIssueCode.too_small,
      minimum,
      type: "number",
      inclusive: true,
      ...errorUtil.errToObj(message),
    });

  max = (maximum: number, message?: errorUtil.ErrMessage) =>
    this.refinement((data) => data <= maximum, {
      code: z.ZodIssueCode.too_big,
      maximum,
      type: "number",
      inclusive: true,
      ...errorUtil.errToObj(message),
    });

  int = (message?: errorUtil.ErrMessage) =>
    this.refinement((data) => Number.isInteger(data), {
      code: z.ZodIssueCode.invalid_type,
      expected: "integer",
      received: "number",
      ...errorUtil.errToObj(message),
    });

  positive = (message?: errorUtil.ErrMessage) =>
    this.refinement((data) => data > 0, {
      code: z.ZodIssueCode.too_small,
      minimum: 0,
      type: "number",
      inclusive: false,
      ...errorUtil.errToObj(message),
    });

  negative = (message?: errorUtil.ErrMessage) =>
    this.refinement((data) => data < 0, {
      code: z.ZodIssueCode.too_big,
      maximum: 0,
      type: "number",
      inclusive: false,
      ...errorUtil.errToObj(message),
    });

  nonpositive = (message?: errorUtil.ErrMessage) =>
    this.refinement((data) => data <= 0, {
      code: z.ZodIssueCode.too_big,
      maximum: 0,
      type: "number",
      inclusive: true,
      ...errorUtil.errToObj(message),
    });

  nonnegative = (message?: errorUtil.ErrMessage) =>
    this.refinement((data) => data >= 0, {
      code: z.ZodIssueCode.too_small,
      minimum: 0,
      type: "number",
      inclusive: true,
      ...errorUtil.errToObj(message),
    });
}

export const integer = Integer.create;

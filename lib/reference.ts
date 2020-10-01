import * as z from "../deps.ts";
import { Integer } from "./integer.ts";

export type ReferenceType =
  | z.ZodObject<z.ZodRawShape>
  | z.ZodArray<z.ZodTypeAny>
  | z.ZodString
  | z.ZodBigInt
  | z.ZodNumber
  | z.ZodBoolean
  | z.ZodOptional<z.ZodTypeAny>
  | z.ZodTypeAny
  | Integer;

export class Reference extends z.ZodType<any> {
  readonly reference: ReferenceType;
  state: {
    name?: string;
  };

  constructor(name: string, type: ReferenceType) {
    super(type._def);
    this.reference = type;
    this.state = { name };
  }

  public toJSON = () => this._def;

  static create(name: string, type: ReferenceType) {
    return new Reference(name, type);
  }
}

export const reference = Reference.create;

import * as z from "./deps.ts";
import { Integer } from "./integer.ts";

export type ReferenceType =
  | z.ZodObject<any>
  | z.ZodArray<any>
  | z.ZodString
  | z.ZodBigInt
  | z.ZodNumber
  | z.ZodBoolean
  | z.ZodOptional<any>
  | z.ZodTypeAny
  | Integer;

export class Reference<T extends ReferenceType> extends z.ZodType<
  T["_output"],
  T["_def"],
  T["_input"]
> {
  readonly reference: ReferenceType;
  state: {
    name?: string;
  };

  constructor(name: string, type: T) {
    super(type._def);
    this.reference = type;
    this.state = { name };
  }

  public toJSON = () => this._def;

  static create<T extends ReferenceType>(name: string, type: T) {
    return new Reference(name, type);
  }
}

export const reference = Reference.create;

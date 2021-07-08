import * as z from "./deps.ts";

export interface IntegerDef extends z.ZodNumberDef {
  format: string;
}

export class Integer extends z.ZodNumber {
  public toJSON = () => this._def;

  constructor(def: IntegerDef) {
    super(def);
  }
  static create = (format?: string): Integer => {
    return new Integer({
      checks: [],
      typeName: z.ZodFirstPartyTypeKind.ZodNumber,
      format: format ?? "int32",
    });
  };
}

export const integer = Integer.create;

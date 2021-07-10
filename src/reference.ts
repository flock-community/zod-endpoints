import { ZodTypeAny } from "zod";

import * as z from "./deps";

export class Reference<T extends ZodTypeAny> extends z.ZodType<
  T["_output"],
  T["_def"],
  T["_input"]
> {
  readonly reference: ZodTypeAny;
  state: {
    name?: string;
  };
  _parse(
    _ctx: z.ParseContext,
    _data: any,
    _parsedType: z.ZodParsedType
  ): z.ParseReturnType<T["_output"]> {
    return this.reference._parse(_ctx, _data, _parsedType);
  }

  constructor(name: string, type: T) {
    super(type._def);
    this.reference = type;
    this.state = { name };
  }

  public toJSON = () => this._def;

  static create<T extends ZodTypeAny>(name: string, type: T) {
    return new Reference(name, type);
  }
}

export const reference = Reference.create;

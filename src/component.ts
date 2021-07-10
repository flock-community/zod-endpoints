import { ZodTypeAny } from "zod";

import * as z from "./deps";

export class Component<T extends ZodTypeAny> extends z.ZodType<
  T["_output"],
  T["_def"],
  T["_input"]
> {
  _parse(
    _ctx: z.ParseContext,
    _data: any,
    _parsedType: z.ZodParsedType
  ): z.ParseReturnType<T["_output"]> {
    return this.component._parse(_ctx, _data, _parsedType);
  }
  readonly component: ZodTypeAny;

  constructor(type: ZodTypeAny) {
    super(type._def);
    this.component = type;
  }

  public toJSON = () => this._def;

  static create(type: ZodTypeAny) {
    return new Component(type);
  }
}

export const component = Component.create;

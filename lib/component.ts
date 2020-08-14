import * as z from "../deps.ts";

export class Component extends z.ZodType<any, any> {
  readonly state: {
    name: string;
  };

  constructor(name: string, type: z.ZodType<any, any>) {
    super(type._def);
    this.state = { name };
  }

  public toJSON = () => this._def;

  static create(name: string, type: z.ZodType<any, any>) {
    return new Component(name, type);
  }
}

export const component = Component.create;

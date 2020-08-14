import * as z from "../deps.ts";

type ParameterState = {
  type: z.ZodType<any, any>;
  name?: string;
  description?: string;
  required?: boolean;
};

export class Parameter extends z.ZodType<any, any> {
  state: ParameterState;

  constructor(type: z.ZodType<any, any>) {
    super(type._def);
    this.state = {
      type,
      name: undefined,
      description: undefined,
      required: false,
    };
  }

  public toJSON = () => this._def;

  public name(name: string) {
    this.state = { ...this.state, name };
    return this;
  }

  public description(description: string) {
    this.state = { ...this.state, description };
    return this;
  }

  public required(required: boolean) {
    this.state = { ...this.state, required };
    return this;
  }

  static create(type: z.ZodType<any, any>) {
    return new Parameter(type);
  }
}

export const parameter = Parameter.create;

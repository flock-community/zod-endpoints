import * as z from "../deps.ts";
import {Integer} from "./integer.ts";

export type ComponentType =
  | z.ZodObject<z.ZodRawShape>
  | z.ZodArray<z.ZodTypeAny>
  | z.ZodString
  | z.ZodBigInt
  | z.ZodNumber
  | z.ZodBoolean
  | z.ZodOptional<z.ZodTypeAny>
  | z.ZodTypeAny
| Integer

export class Component extends z.ZodType<any> {
  readonly component: ComponentType;

  constructor(type: ComponentType) {
    super(type._def);
    this.component = type;
  }

  public toJSON = () => this._def;

  static create(type: ComponentType) {
    return new Component(type);
  }
}

export const component = Component.create;

import * as z from "./deps";
import { Integer } from "./integer";
import { ReferenceType } from "./reference";

export type ComponentType =
  | z.ZodObject<z.ZodRawShape>
  | z.ZodArray<z.ZodTypeAny>
  | z.ZodString
  | z.ZodBigInt
  | z.ZodNumber
  | z.ZodBoolean
  | z.ZodOptional<z.ZodTypeAny>
  | z.ZodTypeAny
  | Integer;

export class Component<T extends ReferenceType>
  extends z.ZodType<T["_output"], T["_def"], T["_input"]> {
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

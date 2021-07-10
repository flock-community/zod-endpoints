export type PickUnion<T, K extends keyof T> = T extends any
  ? { [P in K]: T[P] }
  : never;

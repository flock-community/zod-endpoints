import { tuple, literal } from "./deps.ts";

const x = ["a", "b", "c"]
  .map((x) => literal(x));

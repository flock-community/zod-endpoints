// @ts-ignore TS6133
import { expect, test } from "@jest/globals";
import { ZodError } from "zod";

import * as z from "../index";

test("parameter with number", () => {
  const n = z
    .parameter(z.number().max(100))
    .name("limit")
    .description("How many items to return at one time (max 100)");

  expect(n.parse(50)).toEqual(50);

  try {
    n.parse(400);
  } catch (err) {
    const zerr: z.ZodError = err as ZodError;
    expect(zerr.issues[0].code).toEqual(z.ZodIssueCode.too_big);
    expect(zerr.issues[0].message).toEqual(
      `Value should be less than or equal to 100`
    );
  }
});

test("parameter with string", () => {
  const s = z
    .parameter(z.string().max(7))
    .name("limit")
    .description("How many items to return at one time (max 100)");

  expect(s.parse("123456")).toEqual("123456");

  try {
    s.parse("12345678");
  } catch (err) {
    const zerr: z.ZodError = err as ZodError;
    expect(zerr.issues[0].code).toEqual(z.ZodIssueCode.too_big);
    expect(zerr.issues[0].message).toEqual(
      `Should be at most 7 characters long`
    );
  }
});

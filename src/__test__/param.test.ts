import * as z from "../index";

test("parameter with number", () => {
  const n = z.parameter(z.number().max(100))
    .name("limit")
    .description("How many items to return at one time (max 100)");
  expect(n.check(50)).toBeTruthy();
  expect(n.check(400)).toBeFalsy();
});

test("parameter with string", () => {
  const s = z.parameter(z.string().max(7))
    .name("limit")
    .description("How many items to return at one time (max 100)");
  expect(s.check("123456")).toBeTruthy();
  expect(s.check("12345678")).toBeFalsy();
});

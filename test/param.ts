import {parameter} from "../lib/parameter.ts";
import * as z from "../../zod/src/index.ts";
import {assertEquals} from "https://deno.land/std/testing/asserts.ts";

Deno.test("parameter with number", () => {
    const n = parameter(z.number().max(100))
        .name("limit")
        .description("How many items to return at one time (max 100)")
    assertEquals(true, n.check(50))
    assertEquals(false, n.check(400))
});

Deno.test("parameter with string", () => {
    const s = parameter(z.string().max(7))
        .name("limit")
        .description("How many items to return at one time (max 100)")
    assertEquals(true, s.check("123456"))
    assertEquals(false, s.check("12345678"))
})

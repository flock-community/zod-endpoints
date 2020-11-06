import * as z from "../deno_lib/mod.ts";

export const Error = z.object({
    code: z.integer(),
    message: z.string(),
});

export const Pet = z.object({
    id: z.integer("int64"),
    name: z.string(),
    tag: z.string().optional(),
});

export const Pets = z.array(z.reference("Pet", Pet));
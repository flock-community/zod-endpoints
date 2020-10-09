import * as z from "../mod.ts";
import {Api} from "../mod.ts";

const Error = z.object({
  code: z.integer(),
  message: z.string(),
});

const Pet = z.object({
  id: z.integer("int64"),
  name: z.string(),
  tag: z.string().optional(),
});

const Pets = z.array(z.reference("Pet", Pet));

Deno.test("minimal router", () => {
  const schema = z.router([
    z.route({
      name: "A",
      method: "GET",
      responses: [
        z.response({
          status: 200,
          type: "application/json",
        }),
      ],
    }),
  ]);

  type X = Api<typeof schema>

});

// @ts-ignore TS6133
import { expect, test } from "@jest/globals";

import * as z from "../index";

const project = z.object({
  id: z.string().uuid(),
  name: z.string(),
});

const error = z.object({
  code: z.number(),
  message: z.string(),
});

const errorResponse = z.response({
  status: 500,
  description: "Error occurred",
  body: z.body({
    type: "application/json",
    content: error,
  }),
});

const schema = z.endpoints([
  z.endpoint({
    name: "GET_PROJECT",
    method: "GET",
    path: z.path("projects", z.string().uuid()),
    responses: [
      z.response({
        description: "Found project",
        status: 200,
        body: z.body({
          type: "application/json",
          content: project,
        }),
      }),
      z.response({
        description: "Not found",
        status: 404,
        body: z.body({
          type: "application/json",
          content: error,
        }),
      }),
      errorResponse,
    ],
  }),
  z.endpoint({
    name: "LIST_PROJECT",
    method: "GET",
    path: z.path("projects"),
    headers: {},
    responses: [
      z.response({
        description: "Found project",
        status: 200,
        body: z.body({
          type: "application/json",
          content: z.array(project),
        }),
      }),
      errorResponse,
    ],
  }),
  z.endpoint({
    name: "CREATE_PROJECT",
    method: "POST",
    path: z.path("projects"),
    body: z.body({
      type: "application/json",
      content: project,
    }),
    responses: [
      z.response({
        description: "Created project",
        status: 201,
      }),
      errorResponse,
    ],
  }),
]);

const id = "1a2c8758-e223-11eb-ba80-0242ac130004" as string;
const state: z.infer<typeof project>[] = [];

// @ts-ignore
const client: z.Client<typeof schema> = (req) => {
  console.log(req);
  if (req && req.body && req.method === "POST" && req.path[0] == "projects") {
    state.push(req.body.content);
    return Promise.resolve({
      status: 201,
      body: {
        type: "application/json",
        content: state,
      },
      headers: {},
    });
  }

  if (req.method === "GET" && req.path[1] == id) {
    return Promise.resolve({
      status: 200,
      body: {
        type: "application/json",
        content: state.find((it) => it.id === id),
      },
      headers: {},
    });
  }

  if (req.method === "GET" && req.path[0] == "projects") {
    return Promise.resolve({
      status: 200,
      body: {
        type: "application/json",
        content: state,
      },
      headers: {},
    });
  }

  throw new Error("Cannot respond");
};

test("client", async () => {
  const resPost = await client({
    method: "POST",
    path: ["projects"],
    body: {
      type: "application/json",
      content: {
        id: id,
        name: "Todo 12",
      },
    },
    query: {},
    headers: {},
  });

  expect(resPost.status).toBe(201);

  const resGetList = await client({
    method: "GET",
    path: ["projects"],
    query: {},
    headers: {},
  });

  expect(resGetList.status).toBe(200);
  if (resGetList.status == 200) {
    expect(resGetList.body.content.find((it) => it.id === id)?.id).toBe(id);
  }

  const resGetId = await client({
    method: "GET",
    path: ["projects", id],
    query: {},
    headers: {},
  });

  expect(resGetId.status).toBe(200);
  if (resGetId.status == 200) {
    expect(resGetId.body.content.id).toBe(id);
  }
});

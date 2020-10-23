import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

import * as z from "../deps.ts";
import { object } from "../deps.ts";
import {
  Http,
} from "../lib/model.ts";
import { openApi } from "../openapi.ts";
import { component, parameter } from "../lib/index.ts";
import { OpenAPIObject } from "../utils/openapi3/OpenApi.ts";

const route: Http = {
  name: z.literal("GET_USER").default("GET_USER"),
  method: z.literal("GET"),
  path: z.tuple([z.literal("user")]),
  summary: z.undefined(),
  tags: z.tuple([z.literal("a"), z.literal("b")]).default(["a", "b"]),
  query: object({
    test: parameter(z.number().max(100))
      .description("How many items to return at one time (max 100)"),
  }),
  headers: z.object({}),
  body: z.undefined(),
  responses: z.union([
    z.object({
      description: z.literal("List of projects"),
      status: z.literal(200),
      headers: z.object({}),
      body: z.object({
        type: z.literal("application/json"),
        content: component(z.object({
          uuid: z.string().uuid(),
          name: z.string(),
        })),
      })
    }),
    z.object({
      description: z.literal("Not projects found"),
      status: z.literal(404),
      headers: z.object({}),
      body: z.undefined()
    }),
  ]),
};

const res = openApi(z.object(route));

const exp: OpenAPIObject = {
  "openapi": "3.0.0",
  "info": {
    "version": "1.0.0",
    "title": "No title",
  },
  "servers": [],
  "paths": {
    "/user": {
      "get": {
        "operationId": "GET_USER",
        parameters: [
          {
            description: "How many items to return at one time (max 100)",
            in: "query",
            name: "test",
            required: false,
            schema: {
              format: "int32",
              type: "integer",
            },
          },
        ],
        "summary": undefined,
        "tags": [
          "a",
          "b",
        ],
        requestBody: undefined,
        "responses": {
          "200": {
            "description": "List of projects",
            "headers": undefined,
            "content": {
              "application/json": {
                schema: {
                  properties: {
                    name: {
                      type: "string",
                    },
                    uuid: {
                      type: "string",
                    },
                  },
                  required: [
                    "uuid",
                    "name",
                  ],
                  type: "object",
                },
              },
            },
          },
          "404": {
            description: "Not projects found",
            headers: undefined,
            content: undefined,
          },
        },
      },
    },
  },
  components: undefined,
};

assertEquals(res, exp);

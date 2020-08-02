export type Http = {
  name: string;
  path: string[];
  method: "GET" | "PUT" | "POST" | "DELETE";
  headers?: Record<PropertyKey, string | string[]>;
  body?: Record<PropertyKey, unknown>;
  responses?: {
    status: number;
    headers?: { [k: string]: string | string[] };
    body?: Record<PropertyKey, unknown>;
  };
};


import * as z from "./index";

export type MatchRequest = Pick<z.output<z.HttpRequestObject>, "method" | "path" | "query" | "headers" | "body">

const picker = {name: true, method: true, path: true, query:true, headers:true, body: true} as const
export function matchRequest(schema: z.HttpUnion, req: MatchRequest): z.HttpObject | undefined {
    return schema.options
        .find(endpoint => endpoint.pick(picker).check(req))
}
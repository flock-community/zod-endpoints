import * as z from "./index";

export type MatchRequest = Pick<z.output<z.HttpRequestObject>, "method" | "path" | "query" | "headers" | "body">

const picker = { method: true, path: true, query:true, headers:true, body: true} as const
export function matchRequest<T extends z.HttpUnion>(schema: T, req: MatchRequest): z.HttpObject | undefined {
    return schema.options
        .find(endpoint => endpoint.pick(picker).check(req))
}
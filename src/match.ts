import * as z from "./index";

export type MatchRequest = Pick<z.output<z.HttpRequestObject>, "method" | "path" | "query" | "headers" | "body">
export type MatchResponse = Pick<z.output<z.HttpResponseObject>, "status" | "headers" | "body">

const requestPicker = { method: true, path: true, query:true, headers:true, body: true} as const
const responsePicker = { status: true, headers:true, body: true} as const

export function matchRequest(schema: z.HttpUnion, req: MatchRequest): z.HttpObject | undefined {
    return schema.options
        .find(request => request.pick(requestPicker).check(req))
}

export function matchResponse(responses: z.HttpResponseUnion, req: MatchResponse): z.HttpResponseObject | undefined {
    if ("shape" in responses) {
        return responses;
    }
    if ("options" in responses) {
        return responses.options
            .find(response => response.pick(responsePicker).check(req))
    }
    return undefined

}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchResponse = exports.matchRequest = void 0;
var requestPicker = {
    method: true,
    path: true,
    query: true,
    headers: true,
    body: true,
};
var responsePicker = { status: true, headers: true, body: true };
function matchRequest(schema, req) {
    function check(request) {
        try {
            request.pick(requestPicker).parse(req);
            return true;
        }
        catch (e) {
            return false;
        }
    }
    return schema.options.find(check);
}
exports.matchRequest = matchRequest;
function matchResponse(responses, req) {
    function check(response) {
        try {
            response.pick(responsePicker).parse(req);
            return true;
        }
        catch (e) {
            return false;
        }
    }
    if ("shape" in responses) {
        return responses;
    }
    if ("options" in responses) {
        return responses.options.find(check);
    }
    return undefined;
}
exports.matchResponse = matchResponse;

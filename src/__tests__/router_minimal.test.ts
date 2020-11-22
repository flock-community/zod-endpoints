import * as z from "../index";
import {openApi} from "../openapi";

test("minimal one endpoint", async () => {
    const schema = z.endpoints([
        z.endpoint({
            name: "A",
            method: "GET",
            responses: [
                z.response({
                    status: 200
                })
            ]
        })
    ]);

    const api: z.Api<typeof schema> = {
        A: ({path}) => {
            expect(path[0]).toEqual("");
            return Promise.resolve({status: 200})
        }
    };

    const res = await api["A"]({method: "GET", path: [""]});
    expect(res).toEqual({status: 200});
});

test("minimal endpoint two endpoints", async () => {
    const schema = z.union([
        z.endpoint({
            name: "A",
            method: "GET",
            responses: [
                z.response({
                    status: 200
                })
            ]
        }),
        z.endpoint({
            name: "B",
            method: "POST",
            responses: [
                z.response({
                    status: 200,
                    body: [
                        z.body({
                            type: "application/json",
                            content: z.object({
                                b: z.string()
                            })
                        }),
                        z.body({
                            type: "plain/text",
                            content: z.object({
                                c: z.string()
                            })
                        })
                    ]
                })
            ]
        })
    ]);

    const api: z.Api<typeof schema> = {
        A: () => Promise.resolve({status: 200}),
        B: () => Promise.resolve({
            status: 200,
            body: {type: "application/json", content: {b: "b"}}
        })
    };

    const res = await api["B"]({method: "POST", path: [""]});
    expect(res).toEqual({
        status: 200,
        body: {
            type: "application/json",
            content: {b: "b"}
        }
    });

    const open = openApi(schema);
    expect(open).toEqual({
        components: undefined,
        info: {
            title: "No title",
            version: "1.0.0"
        },
        openapi: "3.0.0",
        paths: {
            "/": {
                get: {
                    operationId: "A",
                    parameters: undefined,
                    requestBody: undefined,
                    responses: {
                        200: {
                            content: undefined,
                            description: undefined,
                            headers: undefined
                        },
                    },
                    summary: undefined,
                    tags: undefined,
                },
                post: {
                    operationId: "B",
                    parameters: undefined,
                    requestBody: undefined,
                    responses: {
                        200: {
                            content: {
                                "application/json": {
                                    schema: {
                                        properties: {
                                            b: {
                                                type: "string"
                                            }
                                        },
                                        required: ["b"],
                                        type: "object"
                                    }
                                },
                                "plain/text": {
                                    schema: {
                                        properties: {
                                            c: {
                                                type: "string"
                                            }
                                        },
                                        required: ["c"],
                                        type: "object"
                                    }
                                }
                            },
                            description: undefined,
                            headers: undefined
                        }
                    },
                    summary: undefined,
                    tags: undefined
                }
            }
        },
        servers: []
    });
});

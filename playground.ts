type Route = {
    method: "GET" | "POST",
    path: [...string[]],
    responses: [...{ status: number }[]]
}

type Router = {
    method: "GET",
    path: ["pets", "id"],
    responses: {status: 200} | {status: 404}
} | {
    method: "POST",
    path: ["pets"],
    responses: {status: 200},

}
type Test =
    | {
    type: 'Union'
    responses:
        | { status: 200 }
        | { status: 400 }
        | { status: 600}

}
    | {
    type: 'Union'
    responses:
        | { status: 100 }
        | { status: 300 }
        | { status: 500}

}

type Flatten<T extends { responses: unknown }> = { [P in keyof T]: P extends 'responses' ? T[P] : never }[keyof T]

type Result = Flatten<Test>;



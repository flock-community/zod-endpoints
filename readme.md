# Zod-router
Zod-router is a contract first strict typed router. For building Http services with TypeScript in Deno of Node.

By defining your 
Zod-router is a typesafe http router for defining and matching requests and responses. Zod router is designed to define a strict contract between client and server. 

Zod router defines a http object as a zod object. It  uses the parse functionality to match a request with the corresponding route (request/responses). 

## Simplified model

Zod-router is based on a type representation of a http schema of requests and responses. The full model can be found here [model](./lib/model.ts). Below a simple representation of the model
````ts
type Body = {
    type: "applictions/json" | "plain/html"
    content: any
}

type Reqest = {
    method: "GET" | "POST" | "PUT" | "DELETE"
    path: [...string[]]
    body: Body | ...Body
}

type Response = {
    status: number
    body: Body | ...Body
}

type Http = Reqest & {
    responses: Response | ...Response
}

type Schema = Http | ...Http
````

## Open api 3


## Getting started
Simple router

### Router
````ts
import * as z from "../mod.ts";

const project = z.object({
  id: z.string().uuid(),
  name: z.string(),
})

const schema = z.router([
  z.route({
    name: "GET_PROJECT",
    method: "GET",
    path: [z.literal("projects"), z.string().uuid()],
    responses: [
      z.response({
        status: 200,
        body:{
          type: "application/json",
          content: project
        }       
      }),
    ],
  }),
  z.route({
    name: "CREATE_PROJECT",
    method: "POST",
    path: [z.literal("projects")]
    body:{
      type: "application/json",
      content: project
    },
    responses: [
      z.response({
        status: 201,  
      }),
    ],
  }),
]);
````


### Api
```ts
const service = {
  findProjectById: (id:string):Project => {},
  createProject: (project:Project) => {},
}

const api: Api<typeof schema> = {
  "GET_PROJECT": ({path}) => findProjectById(path[1]).then(project => ({ status: 200, body:{type: "application/json", content:project}})),
  "CREATE_PROJECT": ({body}) => createProject(body).Promise.resolve({ status: 201 }),
};
```
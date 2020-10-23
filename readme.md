# Zod-router
Zod-router is a contract first strict typed router for building http services with TypeScript. By defining the router as a typed schema all the incoming traffic to the service can be validated against it. The compiler can be leveraged to check of the input of the service is sound. At runtime requests can be early terminated which makes the service more efficient. This narrows down the problem space the focus can be on defining business logic instead of input validation and error handling. On the other hand te schema can be used as a contract between consumer and producer. This can be used to communicate the interface of the service. Drivers can be generate from the contract which ensures proper communication. 


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
Zod router is fully compatible with [open api specification](https://www.openapis.org/). The schema can be transformed into open api by 

![GitHub Logo](images/pets_swagger.png)


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
# Zod-router
Zod-router is a contract first strict typed router for building http services with TypeScript. By defining the router as a typed schema all the incoming and outgoing traffic to the service can be validated against this schema. 

The compiler can be leveraged to check if the input and output of the service is type safe. At runtime requests can be validated and early terminated which makes the service more efficient. 

This narrows down the problem space the focus can be on defining business logic instead of input validation and error handling. On the other hand te schema can be used as a contract between consumer and producer. This can be used to communicate the interface of the service. Drivers can be generate from the contract which ensures proper communication. 


## Simplified model

Zod-router is based on a type representation of a http schema.  Below a simple representation of the model. The full model can be found here [model](./lib/model.ts).

The model is a union of requests which contains a union of response objects. Both request and response can have an union of bodies.

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
Zod router is fully compatible with [open api specification](https://www.openapis.org/). The schema can be transformed into open api json. With Swagger this can be presented as a documentation website.

![GitHub Logo](images/pets_swagger.png)


## Getting started
This first stap is to define the router schema by making use of the zod-router dsl. Below you can find an example of a simple project router. This example contains two endpoints for getting and creating a project

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
    path: [z.literal("projects")],
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
The router can connected to the service the [Api](./lib/api.ts) type transforms the schema into an object of the requests. The key of the object is the name of the route the value is a function from the request to a union of the responses. This object is strict typed and exaustive.

```ts
const service = {
  findProjectById: (id:string):Project => {},
  createProject: (project:Project) => {},
}
````

```ts
import * as z from "../mod.ts";

const api: z.Api<typeof schema> = {
  "GET_PROJECT": ({path}) => findProjectById(path[1]).then(project => ({ 
    status: 200, 
    body:{
      type: "application/json", 
      content:project
    }
  })),
  "CREATE_PROJECT": ({body}) => createProject(body).Promise.resolve({ 
    status: 201 
  }),
};
```

### Client


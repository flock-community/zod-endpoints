# Zod-router
Zod-router is a contract first strict typed router for building http services. By defining the router as a zod schema all the incoming and outgoing traffic can be checked and parsed against it. 

Now the compiler can check if the input and output of the service is type safe. At runtime requests can be validated and early terminated. 

This narrows down the problem space of the service. Once validated by the router, you can safely trust the types from typescript. The focus can shift more to defining business logic instead of input validation and error handling. 

The schema can be used as a contract between consumer and producer. Drivers can be generated from the contract which ensures proper communication between a client and server. 


## Simplified model

Zod-router is based on a type representation of a http schema.  Below a simplyfied version of the model. The full model can be found here [model](./lib/model.ts). The model is a union of requests which contains a union of response objects. Both request and response contain a union of body types.

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
Zod router is fully compatible with [open api specification](https://www.openapis.org/). The schema can be transformed into open api json. For example with Swagger this can be presented as a documentation website.

![GitHub Logo](images/pets_swagger.png)


## Getting started
First step is to define a router by making use of the [zod-router dsl](./lib/router.ts). Below you can find an example of a simple router. This example contains two endpoints to get and create a project.

### Route
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
The router can convert into a service with the [Api](./lib/api.ts) type. This type transforms the schema into an object of the requests. The key of the object is the name of the route the value is a function from the request to a union of the responses. This object is strict typed and exhaustive.

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


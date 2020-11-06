import { serve } from "https://deno.land/std@0.74.0/http/server.ts";
import {openApi} from "../src/mod.ts";
import {schema} from "./router.ts";

const port = 5000

const server = serve({ hostname: "0.0.0.0", port });
console.log(`HTTP webserver running.  Access it at:  http://localhost:${port}/`);

for await (const request of server) {
    let bodyContent = "Your user-agent is:\n\n";
    bodyContent += request.headers.get("user-agent") || "Unknown";

    if(request.url === '/openapi'){
        request.respond({
            status: 200,
            body: JSON.stringify(openApi(schema)),
            headers:new Headers({
                'content-type': 'application/json'
            })
        });
    }else{
        const html = await Deno.readTextFile('index.html');
        request.respond({
            status: 200,
            body: html,
            headers:new Headers({
                'content-type': 'text/html'
            })
        });
    }

}
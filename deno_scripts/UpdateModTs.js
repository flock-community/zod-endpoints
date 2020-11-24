const path = require("path")
const fs = require("fs")

const data = `export * from "./index.ts";`

const dir = path.join(__dirname, `/../deno_lib`)
console.log(dir)
fs.writeFile(path.join(dir, './mod.ts'), data, (err) => {
    if (err) {return console.log(err)}
})
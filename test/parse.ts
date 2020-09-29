import * as z from "../deps.ts";
import {reference} from "../lib/index.ts";

const bigint = z.bigint()
bigint.parse(BigInt(2))

const Pet = z.object({
    id: z.bigint(),
    name: z.string(),
    tag: z.string().optional(),
});

const Pets = z.array(reference("Pet", Pet))

const arr = [
    {id:BigInt(0), name:'a', tag:"Test"},
    {id:BigInt(1), name:'b', tag:"Test"}
]

Pets.parse(arr)
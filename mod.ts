import { number, object, string, boolean, array } from "../zod/src/index.ts";
//import {number, object, string, boolean, array } from 'https://raw.githubusercontent.com/flock-community/zod/deno/src/index.ts';

const Person = object({
  id: number().nullable(),
  name: string(),
  age: number().min(0),
  birthdate: number().or(string()),
  employed: boolean(),
  friendIds: array(number()).nullable(),
});

console.log(JSON.stringify(Person.toJSON(), null, 2));

import * as z from "../deps.ts";
import {HttpSchema} from "./domain.ts";

type RoutNames<T extends HttpSchema> = z.output<T> extends { name: string } ? z.output<T>['name'] : never
type Request<T extends HttpSchema, Key> = Extract<z.output<T>, {name: Key}>
type Response<T extends HttpSchema, Key> = Pick<Extract<z.output<T>, {name: Key}>['responses'], 'status' | 'headers' | 'content'>
type RouteFunction<T extends HttpSchema, Key> = (request: Request<T, Key>) => Promise<Response<T, Key>>

export type Api<T extends HttpSchema> = { [Key in RoutNames<T>]: RouteFunction<T, Key> };
export type ApiFragment<T extends HttpSchema, Key extends RoutNames<T>> = Pick<Api<T>, Key>;
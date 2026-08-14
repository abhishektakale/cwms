/** Typed JSON body from a SuperTest response. */
export function jsonBody<T>(res: { body: unknown }): T {
  return res.body as T;
}

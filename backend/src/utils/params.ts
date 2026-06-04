import type { Request } from "express";

/** Express 5 params may be string | string[] */
export function paramId(req: Request, name = "id"): string {
  const raw = req.params[name];
  if (Array.isArray(raw)) return raw[0] ?? "";
  return raw ?? "";
}

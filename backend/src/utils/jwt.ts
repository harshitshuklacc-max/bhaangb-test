import jwt from "jsonwebtoken";
import type { Role } from "@prisma/client";

export interface JwtPayload {
  sub: string;
  role: Role;
  username: string;
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured");
  return secret;
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: "8h" });
}

export function signRefreshToken(payload: JwtPayload): string {
  const refresh = process.env.JWT_REFRESH_SECRET ?? getSecret();
  return jwt.sign(payload, refresh, { expiresIn: "7d" });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, getSecret()) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  const refresh = process.env.JWT_REFRESH_SECRET ?? getSecret();
  return jwt.verify(token, refresh) as JwtPayload;
}

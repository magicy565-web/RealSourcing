import type { CookieOptions, Request } from "express";

export function getSessionCookieOptions(
  req: Request
): CookieOptions {
  // Use bracket notation to bypass strict type checking for property access
  const protocol = (req as any).protocol;
  const headers = (req as any).headers;
  
  const isSecure = protocol === "https" || headers?.["x-forwarded-proto"] === "https";

  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecure,
    domain: undefined,
  };
}

import { COOKIE_NAME, ONE_YEAR_MS } from "../../shared/const.js";

/**
 * 设置认证 Cookie
 */
export function setAuthCookie(res: any, token: string) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: ONE_YEAR_MS,
    path: "/",
  });
}

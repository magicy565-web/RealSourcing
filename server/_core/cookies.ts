import type { CookieOptions, Request } from "express";
import { COOKIE_NAME, ONE_YEAR_MS } from "../../shared/const.js";

export function getSessionCookieOptions(
  req: Request
): CookieOptions {
  const protocol = (req as any).protocol;
  const headers = (req as any).headers;
  
  const isSecure = protocol === "https" || headers?.["x-forwarded-proto"] === "https";

  return {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: isSecure,
    domain: undefined,
  };
}

/**
 * 设置认证 Cookie
 */
export function setAuthCookie(res: any, token: string) {
  const isProd = process.env.NODE_ENV === "production";
  
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd, // 生产环境下必须为 true (HTTPS)
    sameSite: isProd ? "none" : "lax", // 生产环境下使用 none 以支持 Vercel 跨域场景
    maxAge: ONE_YEAR_MS,
    path: "/",
  });
}

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
  // 判断是否是 HTTPS 环境
  const isSecure = res.req?.protocol === "https" || res.req?.headers?.["x-forwarded-proto"] === "https";
  
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isSecure, // HTTPS 环境下必须为 true
    sameSite: isSecure ? "none" : "lax", // HTTPS 下使用 none 以支持跨域
    maxAge: ONE_YEAR_MS,
    path: "/",
  });
}

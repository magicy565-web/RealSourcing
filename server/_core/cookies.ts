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

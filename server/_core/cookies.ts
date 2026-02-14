import type { CookieOptions, Request } from "express";

export function getSessionCookieOptions(
  req: Request
): CookieOptions {
  const isSecure = req.protocol === "https" || req.headers["x-forwarded-proto"] === "https";

  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecure,
    // Explicitly provide domain as undefined to satisfy Pick/CookieOptions constraints if needed
    domain: undefined,
  };
}

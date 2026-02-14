import { SignJWT } from "jose";
import "dotenv/config";

const COOKIE_NAME = "app_session_id";
const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
const JWT_SECRET = "realsourcing-session-secret-key-2024";
const APP_ID = "realsourcing-app-id";

async function main() {
  const openId = "demo-user-id";
  const name = "Demo User";
  
  const issuedAt = Date.now();
  const expirationSeconds = Math.floor((issuedAt + ONE_YEAR_MS) / 1000);
  const secretKey = new TextEncoder().encode(JWT_SECRET);

  const token = await new SignJWT({
    openId,
    appId: APP_ID,
    name,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expirationSeconds)
    .sign(secretKey);
    
  console.log(token);
}

main().catch(console.error);

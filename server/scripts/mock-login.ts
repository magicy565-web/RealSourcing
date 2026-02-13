import { getDb, upsertUser, getUserByOpenId } from "../db";
import { users } from "../../drizzle/schema";
import { SignJWT } from "jose";
import "dotenv/config";

const COOKIE_NAME = "app_session_id";
const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;

async function createOrUpdateTestUser(email: string, name: string) {
  const openId = `mock_user_${email.replace(/[^a-zA-Z0-9]/g, ".")}`;

  let user = await getUserByOpenId(openId);

  if (!user) {
    // Create new user if not found
    await upsertUser({
      openId,
      name,
      email,
      loginMethod: "mock",
      role: "factory", // Assign 'factory' role for testing SaaS features
      lastSignedIn: new Date(),
    });
    user = await getUserByOpenId(openId); // Retrieve the newly created user
    console.log("New test user created.");
  } else {
    // Update existing user
    await upsertUser({
      openId,
      name,
      email,
      loginMethod: "mock",
      role: "factory", // Ensure role is factory
      lastSignedIn: new Date(),
    });
    user = await getUserByOpenId(openId); // Retrieve the updated user
    console.log("Existing test user updated.");
  }

  if (!user) {
    throw new Error("Failed to create or retrieve user.");
  }

  return user;
}

async function generateSessionToken(user: any) {
  const secret = process.env.JWT_SECRET;
  const appId = process.env.VITE_APP_ID;

  if (!secret) {
    console.error("JWT_SECRET is not configured! Set JWT_SECRET environment variable.");
    process.exit(1);
  }

  if (!appId) {
    console.error("VITE_APP_ID is not configured! Set VITE_APP_ID environment variable.");
    process.exit(1);
  }

  const issuedAt = Date.now();
  const expirationSeconds = Math.floor((issuedAt + ONE_YEAR_MS) / 1000);
  const secretKey = new TextEncoder().encode(secret);

  return new SignJWT({
    openId: user.openId,
    appId: appId,
    name: user.name,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expirationSeconds)
    .sign(secretKey);
}

async function main() {
  const testEmail = "magic@gmail.com";
  const testName = "Magic User";

  console.log(`Creating/Updating test user: ${testName} (${testEmail})`);
  const user = await createOrUpdateTestUser(testEmail, testName);
  console.log("User upserted into DB");

  const token = await generateSessionToken(user);

  console.log("\n--- MOCK LOGIN SUCCESS ---");
  console.log(`Cookie Name: ${COOKIE_NAME}`);
  console.log(`Token: ${token}`);
  console.log("\nInstructions:");
  console.log("1. Open your browser");
  console.log("2. Open DevTools (F12) -> Application -> Cookies");
  console.log(`3. Add a new cookie: Name=\'${COOKIE_NAME}\", Value=\'${token}\'`);
  console.log("4. Refresh the page");
}

main().catch(console.error);

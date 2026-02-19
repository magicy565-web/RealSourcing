import { sdk } from "./server/_core/sdk.js";
import { ENV } from "./server/_core/env.js";
import { signToken } from "./server/_core/auth.js";

async function debug() {
  console.log("--- Auth Debug V2 ---");
  console.log("ENV.appId:", ENV.appId);
  console.log("process.env.APP_ID:", process.env.APP_ID);
  
  const payload = { openId: "test-user", name: "Test User" };
  
  // 1. Test signToken (which uses process.env.APP_ID || 'realsourcing')
  const token = await signToken(payload);
  console.log("Generated Token:", token);
  
  // 2. Test verifySession (which uses ENV.appId for validation if implemented, oh wait, sdk.ts doesn't check appId during verifySession)
  const session = await sdk.verifySession(token);
  console.log("Verified Session:", session);
  
  if (session) {
    console.log("AppId in session:", session.appId);
    if (session.appId !== ENV.appId) {
      console.error("CRITICAL: AppId mismatch!");
      console.error(`Session has: ${session.appId}, but ENV.appId is: ${ENV.appId}`);
    } else {
      console.log("AppId matches ENV.appId");
    }
  } else {
    console.error("Session verification failed!");
  }
}

debug().catch(console.error);

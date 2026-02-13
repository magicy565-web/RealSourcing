/**
 * Test Agora Token Generation
 * 
 * Usage:
 *   pnpm exec tsx server/scripts/test-agora-token.ts
 */

import { generateRtcToken } from "../lib/agora-token";

console.log("🧪 Testing Agora Token Generation...\n");

// Check environment variables
const APP_ID = process.env.AGORA_APP_ID;
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

console.log("Environment Variables:");
console.log(`AGORA_APP_ID: ${APP_ID ? "✅ Set" : "❌ Not set"}`);
console.log(`AGORA_APP_CERTIFICATE: ${APP_CERTIFICATE ? "✅ Set" : "❌ Not set"}`);
console.log();

if (!APP_ID || !APP_CERTIFICATE) {
  console.error("❌ Agora credentials are not configured!");
  console.log("\nTo configure Agora:");
  console.log("1. Sign up at https://console.agora.io/");
  console.log("2. Create a project and get APP_ID and APP_CERTIFICATE");
  console.log("3. Set environment variables:");
  console.log("   export AGORA_APP_ID=your-app-id");
  console.log("   export AGORA_APP_CERTIFICATE=your-app-certificate");
  process.exit(1);
}

// Test token generation
const testChannelName = "test-channel-12345";
const testUid = 12345;

console.log("Test Parameters:");
console.log(`Channel Name: ${testChannelName}`);
console.log(`UID: ${testUid}`);
console.log();

console.log("Generating token...");
const token = generateRtcToken(testChannelName, testUid);

if (token) {
  console.log("✅ Token generated successfully!");
  console.log();
  console.log("Token Details:");
  console.log(`Length: ${token.length} characters`);
  console.log(`First 50 chars: ${token.substring(0, 50)}...`);
  console.log();
  console.log("Token Structure:");
  console.log(`- APP_ID: ${APP_ID}`);
  console.log(`- Channel: ${testChannelName}`);
  console.log(`- UID: ${testUid}`);
  console.log(`- Role: PUBLISHER`);
  console.log(`- Expiration: 1 hour`);
  console.log();
  console.log("✅ Agora Token Generation Test Passed!");
} else {
  console.error("❌ Token generation failed!");
  process.exit(1);
}

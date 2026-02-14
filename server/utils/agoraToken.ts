/**
 * Agora Token Generation Utilities
 * Supports RTC and RTM token generation
 */

import { RtcTokenBuilder, RtcRole, RtmTokenBuilder, RtmRole } from 'agora-access-token';

// Agora credentials - should be stored in environment variables
const AGORA_APP_ID = process.env.AGORA_APP_ID || '';
const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE || '';

/**
 * Generate RTC (Real-Time Communication) Token
 * Used for video/audio calls
 */
export function generateRTCToken(
  channelName: string,
  uid: number,
  role: 'publisher' | 'subscriber' = 'publisher',
  expirationTimeInSeconds: number = 3600
): string {
  if (!AGORA_APP_ID || !AGORA_APP_CERTIFICATE) {
    throw new Error('Agora credentials not configured');
  }

  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  const agoraRole = role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;

  const token = RtcTokenBuilder.buildTokenWithUid(
    AGORA_APP_ID,
    AGORA_APP_CERTIFICATE,
    channelName,
    uid,
    agoraRole,
    privilegeExpiredTs
  );

  return token;
}

/**
 * Generate RTM (Real-Time Messaging) Token
 * Used for text messaging
 */
export function generateRTMToken(
  userId: string,
  expirationTimeInSeconds: number = 3600
): string {
  if (!AGORA_APP_ID || !AGORA_APP_CERTIFICATE) {
    throw new Error('Agora credentials not configured');
  }

  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  const token = RtmTokenBuilder.buildToken(
    AGORA_APP_ID,
    AGORA_APP_CERTIFICATE,
    userId,
    RtmRole.Rtm_User,
    privilegeExpiredTs
  );

  return token;
}

/**
 * Validate token expiration
 */
export function isTokenExpired(expirationTimestamp: number): boolean {
  const currentTimestamp = Math.floor(Date.now() / 1000);
  return currentTimestamp >= expirationTimestamp;
}

/**
 * Get Agora App ID
 */
export function getAgoraAppId(): string {
  return AGORA_APP_ID;
}

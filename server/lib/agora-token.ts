import AgoraToken from 'agora-access-token';
const { RtcTokenBuilder, RtcRole } = AgoraToken;

const APP_ID = process.env.AGORA_APP_ID || '';
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE || '';

/**
 * Generate an Agora RTC Token for a given channel and UID
 */
export function generateRtcToken(channelName: string, uid: number | string) {
  if (!APP_ID || !APP_CERTIFICATE) {
    console.warn('⚠️ AGORA_APP_ID or AGORA_APP_CERTIFICATE is missing. Token generation will fail.');
    return null;
  }

  const role = RtcRole.PUBLISHER;
  const expirationTimeInSeconds = 3600; // 1 hour
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  try {
    let token: string;
    if (typeof uid === 'number') {
      token = RtcTokenBuilder.buildTokenWithUid(
        APP_ID,
        APP_CERTIFICATE,
        channelName,
        uid,
        role,
        privilegeExpiredTs
      );
    } else {
      // If uid is a string, it might be a numeric string or a real string
      const numericUid = Number(uid);
      if (!isNaN(numericUid) && numericUid !== 0) {
        token = RtcTokenBuilder.buildTokenWithUid(
          APP_ID,
          APP_CERTIFICATE,
          channelName,
          numericUid,
          role,
          privilegeExpiredTs
        );
      } else {
        token = RtcTokenBuilder.buildTokenWithAccount(
          APP_ID,
          APP_CERTIFICATE,
          channelName,
          uid,
          role,
          privilegeExpiredTs
        );
      }
    }
    return token;
  } catch (error) {
    console.error('Failed to generate Agora token:', error);
    return null;
  }
}

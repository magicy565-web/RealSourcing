export const ENV = {
  appId: process.env.VITE_APP_ID ?? process.env.APP_ID ?? "realsourcing-dev",
  cookieSecret: process.env.JWT_SECRET ?? process.env.COOKIE_SECRET ?? process.env.SESSION_SECRET ?? "realsourcing-dev-secret",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  // 阿里云 OSS 配置
  ossRegion: process.env.OSS_REGION ?? "oss-cn-hangzhou",
  ossAccessKeyId: process.env.OSS_ACCESS_KEY_ID ?? "",
  ossAccessKeySecret: process.env.OSS_ACCESS_KEY_SECRET ?? "",
  ossBucket: process.env.OSS_BUCKET ?? "demand-os-discord",
  ossEndpoint: process.env.OSS_ENDPOINT ?? "",
  ossCdnDomain: process.env.OSS_CDN_DOMAIN ?? "",
  // 声网配置
  agoraAppId: process.env.AGORA_APP_ID ?? "",
  agoraCertificate: process.env.AGORA_CERTIFICATE ?? "",
  agoraCustomerId: process.env.AGORA_CUSTOMER_ID ?? "",
  agoraCustomerSecret: process.env.AGORA_CUSTOMER_SECRET ?? "",
};

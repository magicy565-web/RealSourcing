/**
 * WeChat Pay Integration
 * 
 * This module provides integration with WeChat Pay for payment processing.
 * 
 * Documentation: https://pay.weixin.qq.com/wiki/doc/apiv3/index.shtml
 */

import crypto from "crypto";

interface WechatPayConfig {
  appId: string;
  mchId: string; // Merchant ID
  apiKey: string; // API Key v3
  serialNo: string; // Certificate serial number
  privateKey: string; // Private key for signing
  publicKey: string; // WeChat Pay public key for verification
}

interface CreateOrderParams {
  outTradeNo: string; // Order number
  description: string; // Product description
  totalAmount: number; // Amount in cents (分)
  notifyUrl?: string; // Webhook URL for payment notification
}

interface WechatPayNotifyParams {
  [key: string]: any;
}

/**
 * Get WeChat Pay configuration from environment variables
 */
function getWechatPayConfig(): WechatPayConfig {
  const appId = process.env.WECHAT_APP_ID;
  const mchId = process.env.WECHAT_MCH_ID;
  const apiKey = process.env.WECHAT_API_KEY;
  const serialNo = process.env.WECHAT_SERIAL_NO;
  const privateKey = process.env.WECHAT_PRIVATE_KEY;
  const publicKey = process.env.WECHAT_PUBLIC_KEY;

  if (!appId || !mchId || !apiKey || !serialNo || !privateKey || !publicKey) {
    throw new Error(
      "WeChat Pay configuration is missing. Please set WECHAT_APP_ID, WECHAT_MCH_ID, WECHAT_API_KEY, WECHAT_SERIAL_NO, WECHAT_PRIVATE_KEY, and WECHAT_PUBLIC_KEY in environment variables."
    );
  }

  return {
    appId,
    mchId,
    apiKey,
    serialNo,
    privateKey,
    publicKey,
  };
}

/**
 * Generate signature for WeChat Pay request
 */
function sign(content: string, privateKey: string): string {
  const sign = crypto.createSign("RSA-SHA256");
  sign.update(content);
  return sign.sign(privateKey, "base64");
}

/**
 * Verify signature from WeChat Pay response
 */
function verify(content: string, signature: string, publicKey: string): boolean {
  const verify = crypto.createVerify("RSA-SHA256");
  verify.update(content);
  return verify.verify(publicKey, signature, "base64");
}

/**
 * Generate authorization header for WeChat Pay API v3
 */
function generateAuthHeader(
  method: string,
  url: string,
  body: string,
  config: WechatPayConfig
): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const nonce = crypto.randomBytes(16).toString("hex");

  const signContent = `${method}\n${url}\n${timestamp}\n${nonce}\n${body}\n`;
  const signature = sign(signContent, config.privateKey);

  return `WECHATPAY2-SHA256-RSA2048 mchid="${config.mchId}",nonce_str="${nonce}",signature="${signature}",timestamp="${timestamp}",serial_no="${config.serialNo}"`;
}

/**
 * Create WeChat Pay Native payment order (QR code payment)
 * 
 * @param params Order parameters
 * @returns QR code URL
 */
export async function createWechatPayOrder(
  params: CreateOrderParams
): Promise<string> {
  const config = getWechatPayConfig();

  const requestBody = {
    appid: config.appId,
    mchid: config.mchId,
    description: params.description,
    out_trade_no: params.outTradeNo,
    notify_url: params.notifyUrl || `${process.env.APP_URL}/api/webhooks/wechatpay`,
    amount: {
      total: params.totalAmount,
      currency: "CNY",
    },
  };

  const url = "/v3/pay/transactions/native";
  const body = JSON.stringify(requestBody);
  const authHeader = generateAuthHeader("POST", url, body, config);

  // TODO: Implement HTTP request to WeChat Pay API
  // For now, return a placeholder QR code URL
  const qrCodeUrl = `weixin://wxpay/bizpayurl?pr=${params.outTradeNo}`;

  return qrCodeUrl;
}

/**
 * Verify WeChat Pay notification signature
 * 
 * @param params Notification parameters from WeChat Pay
 * @returns true if signature is valid
 */
export function verifyWechatPayNotify(params: WechatPayNotifyParams): boolean {
  const config = getWechatPayConfig();

  const { timestamp, nonce, signature, body } = params;

  if (!timestamp || !nonce || !signature || !body) {
    return false;
  }

  const signContent = `${timestamp}\n${nonce}\n${body}\n`;
  return verify(signContent, signature, config.publicKey);
}

/**
 * Decrypt WeChat Pay notification resource
 * 
 * @param encryptedData Encrypted data from WeChat Pay
 * @param nonce Nonce from WeChat Pay
 * @param associatedData Associated data from WeChat Pay
 * @returns Decrypted data
 */
export function decryptWechatPayResource(
  encryptedData: string,
  nonce: string,
  associatedData: string
): string {
  const config = getWechatPayConfig();

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    config.apiKey,
    nonce
  );

  decipher.setAuthTag(Buffer.from(encryptedData.slice(-32), "hex"));
  decipher.setAAD(Buffer.from(associatedData));

  let decrypted = decipher.update(
    encryptedData.slice(0, -32),
    "base64",
    "utf8"
  );
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Query WeChat Pay order status
 * 
 * @param outTradeNo Order number
 * @returns Order status
 */
export async function queryWechatPayOrder(outTradeNo: string): Promise<any> {
  const config = getWechatPayConfig();

  const url = `/v3/pay/transactions/out-trade-no/${outTradeNo}?mchid=${config.mchId}`;
  const authHeader = generateAuthHeader("GET", url, "", config);

  // TODO: Implement HTTP request to WeChat Pay API
  // For now, return a placeholder
  return { status: "pending" };
}

/**
 * Close WeChat Pay order
 * 
 * @param outTradeNo Order number
 * @returns Success status
 */
export async function closeWechatPayOrder(outTradeNo: string): Promise<boolean> {
  const config = getWechatPayConfig();

  const requestBody = {
    mchid: config.mchId,
  };

  const url = `/v3/pay/transactions/out-trade-no/${outTradeNo}/close`;
  const body = JSON.stringify(requestBody);
  const authHeader = generateAuthHeader("POST", url, body, config);

  // TODO: Implement HTTP request to WeChat Pay API
  // For now, return true
  return true;
}

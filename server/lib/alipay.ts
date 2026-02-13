/**
 * Alipay Payment Integration
 * 
 * This module provides integration with Alipay for payment processing.
 * 
 * Documentation: https://opendocs.alipay.com/
 */

import crypto from "crypto";

interface AlipayConfig {
  appId: string;
  privateKey: string;
  alipayPublicKey: string;
  gateway: string;
}

interface CreateOrderParams {
  outTradeNo: string; // Order number
  subject: string; // Product name
  totalAmount: string; // Amount in CNY
  body?: string; // Product description
  returnUrl?: string; // Return URL after payment
  notifyUrl?: string; // Webhook URL for payment notification
}

interface AlipayNotifyParams {
  [key: string]: string;
}

/**
 * Get Alipay configuration from environment variables
 */
function getAlipayConfig(): AlipayConfig {
  const appId = process.env.ALIPAY_APP_ID;
  const privateKey = process.env.ALIPAY_PRIVATE_KEY;
  const alipayPublicKey = process.env.ALIPAY_PUBLIC_KEY;

  if (!appId || !privateKey || !alipayPublicKey) {
    throw new Error("Alipay configuration is missing. Please set ALIPAY_APP_ID, ALIPAY_PRIVATE_KEY, and ALIPAY_PUBLIC_KEY in environment variables.");
  }

  return {
    appId,
    privateKey,
    alipayPublicKey,
    gateway: "https://openapi.alipay.com/gateway.do",
  };
}

/**
 * Generate RSA signature for Alipay request
 */
function sign(content: string, privateKey: string): string {
  const sign = crypto.createSign("RSA-SHA256");
  sign.update(content, "utf8");
  return sign.sign(privateKey, "base64");
}

/**
 * Verify RSA signature from Alipay response
 */
function verify(content: string, signature: string, publicKey: string): boolean {
  const verify = crypto.createVerify("RSA-SHA256");
  verify.update(content, "utf8");
  return verify.verify(publicKey, signature, "base64");
}

/**
 * Sort parameters and generate sign content
 */
function getSignContent(params: Record<string, any>): string {
  const keys = Object.keys(params).sort();
  const signParams: string[] = [];

  for (const key of keys) {
    const value = params[key];
    if (value !== undefined && value !== null && value !== "" && key !== "sign") {
      signParams.push(`${key}=${value}`);
    }
  }

  return signParams.join("&");
}

/**
 * Create Alipay payment order (PC website payment)
 * 
 * @param params Order parameters
 * @returns Payment URL
 */
export async function createAlipayOrder(params: CreateOrderParams): Promise<string> {
  const config = getAlipayConfig();

  const bizContent = {
    out_trade_no: params.outTradeNo,
    product_code: "FAST_INSTANT_TRADE_PAY",
    total_amount: params.totalAmount,
    subject: params.subject,
    body: params.body || params.subject,
  };

  const requestParams: Record<string, string> = {
    app_id: config.appId,
    method: "alipay.trade.page.pay",
    charset: "utf-8",
    sign_type: "RSA2",
    timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
    version: "1.0",
    biz_content: JSON.stringify(bizContent),
  };

  if (params.returnUrl) {
    requestParams.return_url = params.returnUrl;
  }

  if (params.notifyUrl) {
    requestParams.notify_url = params.notifyUrl;
  }

  // Generate signature
  const signContent = getSignContent(requestParams);
  const signature = sign(signContent, config.privateKey);
  requestParams.sign = signature;

  // Build payment URL
  const queryString = Object.keys(requestParams)
    .map((key) => `${key}=${encodeURIComponent(requestParams[key])}`)
    .join("&");

  return `${config.gateway}?${queryString}`;
}

/**
 * Verify Alipay notification signature
 * 
 * @param params Notification parameters from Alipay
 * @returns true if signature is valid
 */
export function verifyAlipayNotify(params: AlipayNotifyParams): boolean {
  const config = getAlipayConfig();
  const signature = params.sign;

  if (!signature) {
    return false;
  }

  const signContent = getSignContent(params);
  return verify(signContent, signature, config.alipayPublicKey);
}

/**
 * Query Alipay order status
 * 
 * @param outTradeNo Order number
 * @returns Order status
 */
export async function queryAlipayOrder(outTradeNo: string): Promise<any> {
  const config = getAlipayConfig();

  const bizContent = {
    out_trade_no: outTradeNo,
  };

  const requestParams: Record<string, string> = {
    app_id: config.appId,
    method: "alipay.trade.query",
    charset: "utf-8",
    sign_type: "RSA2",
    timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
    version: "1.0",
    biz_content: JSON.stringify(bizContent),
  };

  // Generate signature
  const signContent = getSignContent(requestParams);
  const signature = sign(signContent, config.privateKey);
  requestParams.sign = signature;

  // Make HTTP request to Alipay gateway
  const queryString = Object.keys(requestParams)
    .map((key) => `${key}=${encodeURIComponent(requestParams[key])}`)
    .join("&");

  const url = `${config.gateway}?${queryString}`;

  // TODO: Implement HTTP request
  // For now, return a placeholder
  return { status: "pending" };
}

/**
 * Create Alipay QR code payment (for mobile)
 * 
 * @param params Order parameters
 * @returns QR code content
 */
export async function createAlipayQRCode(params: CreateOrderParams): Promise<string> {
  const config = getAlipayConfig();

  const bizContent = {
    out_trade_no: params.outTradeNo,
    product_code: "FACE_TO_FACE_PAYMENT",
    total_amount: params.totalAmount,
    subject: params.subject,
    body: params.body || params.subject,
  };

  const requestParams: Record<string, string> = {
    app_id: config.appId,
    method: "alipay.trade.precreate",
    charset: "utf-8",
    sign_type: "RSA2",
    timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
    version: "1.0",
    biz_content: JSON.stringify(bizContent),
  };

  if (params.notifyUrl) {
    requestParams.notify_url = params.notifyUrl;
  }

  // Generate signature
  const signContent = getSignContent(requestParams);
  const signature = sign(signContent, config.privateKey);
  requestParams.sign = signature;

  // Build request URL
  const queryString = Object.keys(requestParams)
    .map((key) => `${key}=${encodeURIComponent(requestParams[key])}`)
    .join("&");

  const url = `${config.gateway}?${queryString}`;

  // TODO: Implement HTTP request and parse response
  // For now, return the URL
  return url;
}

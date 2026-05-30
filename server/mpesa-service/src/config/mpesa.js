import dotenv from 'dotenv';
dotenv.config();

const isSandbox = (process.env.MPESA_ENVIRONMENT || 'sandbox').toLowerCase() !== 'production';

export const mpesaConfig = {
  consumerKey:      process.env.MPESA_CONSUMER_KEY,
  consumerSecret:   process.env.MPESA_CONSUMER_SECRET,
  passKey:          process.env.MPESA_PASSKEY,
  shortCode:        process.env.MPESA_SHORTCODE,
  callbackUrl:      process.env.MPESA_CALLBACK_URL,
  accountReference: process.env.MPESA_ACCOUNT_REFERENCE || 'SiasaHub',
  transactionDesc:  process.env.MPESA_TRANSACTION_DESC  || 'Payment for SiasaHub',
  baseUrl: isSandbox
    ? 'https://sandbox.safaricom.co.ke'
    : 'https://api.safaricom.co.ke',
  environment: isSandbox ? 'sandbox' : 'production',
};

// Validate on startup
const required = ['consumerKey', 'consumerSecret', 'passKey', 'shortCode', 'callbackUrl'];
const missing  = required.filter(k => !mpesaConfig[k]);
if (missing.length) {
  console.error(`❌ [M-Pesa] Missing env vars: ${missing.join(', ')}`);
}
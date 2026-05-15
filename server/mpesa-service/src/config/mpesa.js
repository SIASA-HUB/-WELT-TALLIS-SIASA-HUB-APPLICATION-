import dotenv from 'dotenv';
dotenv.config();

export const mpesaConfig = {
  consumerKey: process.env.MPESA_CONSUMER_KEY,
  consumerSecret: process.env.MPESA_CONSUMER_SECRET,
  passKey: process.env.MPESA_PASSKEY,
  shortCode: process.env.MPESA_SHORTCODE,
  tillNumber: process.env.MPESA_TILL_NUMBER,
  initiatorName: process.env.MPESA_INITIATOR_NAME,
  initiatorPassword: process.env.MPESA_INITIATOR_PASSWORD,
  callbackUrl: process.env.MPESA_CALLBACK_URL,
  accountReference: process.env.MPESA_ACCOUNT_REFERENCE || 'SiasaHub',
  transactionDesc: process.env.MPESA_TRANSACTION_DESC || 'Payment for SiasaHub Services',
  environment: process.env.MPESA_ENVIRONMENT || 'sandbox', // 'sandbox' or 'production'
  baseUrl: process.env.MPESA_ENVIRONMENT === 'production' 
    ? 'https://api.safaricom.co.ke' 
    : 'https://sandbox.safaricom.co.ke'
};

import dotenv from 'dotenv';
dotenv.config();

// =============================================
// SAFARICOM SANDBOX CONSTANTS
// These are fixed by Safaricom and CANNOT be changed
// =============================================
const SANDBOX_SHORTCODE = '174379';
const SANDBOX_PASSKEY = 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
const SANDBOX_URL = 'https://sandbox.safaricom.co.ke';
const PRODUCTION_URL = 'https://api.safaricom.co.ke';

// =============================================
// AUTO-DETECT ENVIRONMENT FROM CREDENTIALS
// =============================================
const rawEnv = (process.env.MPESA_ENVIRONMENT || 'sandbox').toLowerCase();
const envPassKey = process.env.MPESA_PASSKEY || '';

// If the passkey matches the well-known Safaricom sandbox passkey, we MUST use sandbox
const isSandboxCreds = envPassKey === SANDBOX_PASSKEY;
const resolvedEnv = isSandboxCreds ? 'sandbox' : rawEnv;
const isSandbox = resolvedEnv !== 'production';

if (isSandboxCreds && rawEnv === 'production') {
  console.warn('⚠️ [M-Pesa Config] MPESA_ENVIRONMENT=production but SANDBOX passkey detected. Forcing sandbox mode.');
  console.warn('⚠️ [M-Pesa Config] To use production, replace MPESA_PASSKEY with your live passkey from Daraja.');
}

// =============================================
// RESOLVED CONFIGURATION
// For sandbox: override shortcode to 174379 (required by Safaricom)
// For production: use whatever is in .env
// =============================================
const resolvedShortCode = isSandbox ? SANDBOX_SHORTCODE : (process.env.MPESA_SHORTCODE || process.env.MPESA_TILL_NUMBER);
const resolvedTillNumber = isSandbox ? null : (process.env.MPESA_TILL_NUMBER || null);
const resolvedPassKey = isSandbox ? SANDBOX_PASSKEY : envPassKey;

export const mpesaConfig = {
  // Credentials
  consumerKey: process.env.MPESA_CONSUMER_KEY || '',
  consumerSecret: process.env.MPESA_CONSUMER_SECRET || '',
  passKey: resolvedPassKey,

  // Shortcodes — sandbox always uses 174379
  shortCode: resolvedShortCode,
  tillNumber: resolvedTillNumber,

  // In sandbox: always PayBill. In production: BuyGoods if till exists
  isBuyGoods: !isSandbox && !!process.env.MPESA_TILL_NUMBER,
  transactionType: (!isSandbox && !!process.env.MPESA_TILL_NUMBER)
    ? 'CustomerBuyGoodsOnline'
    : 'CustomerPayBillOnline',

  // URLs
  callbackUrl: process.env.MPESA_CALLBACK_URL || 'https://siasahub.co.ke/api/v1/mpesa/callback',
  baseUrl: isSandbox ? SANDBOX_URL : PRODUCTION_URL,

  // Defaults
  accountReference: process.env.MPESA_ACCOUNT_REFERENCE || 'SiasaHub',
  transactionDesc: process.env.MPESA_TRANSACTION_DESC || 'Payment for SiasaHub Services',
  environment: resolvedEnv,

  // Extra (for B2B etc)
  initiatorName: process.env.MPESA_INITIATOR_NAME,
  initiatorPassword: process.env.MPESA_INITIATOR_PASSWORD,
};

// =============================================
// STARTUP VALIDATION
// =============================================
const required = ['consumerKey', 'consumerSecret', 'passKey', 'shortCode', 'callbackUrl'];
const missing = required.filter(k => !mpesaConfig[k]);
if (missing.length > 0) {
  console.error(`❌ [M-Pesa Config] Missing required config: ${missing.join(', ')}`);
  console.error('❌ [M-Pesa Config] Set these in your .env file. M-Pesa payments WILL FAIL.');
}

// Log resolved config (no secrets)
console.log('═══════════════════════════════════════════');
console.log('🔧 [M-Pesa Config] Resolved Configuration:');
console.log(`   Environment:      ${mpesaConfig.environment}`);
console.log(`   Base URL:         ${mpesaConfig.baseUrl}`);
console.log(`   ShortCode:        ${mpesaConfig.shortCode}`);
console.log(`   Till Number:      ${mpesaConfig.tillNumber || '(none — using PayBill)'}`);
console.log(`   Transaction Type: ${mpesaConfig.transactionType}`);
console.log(`   Callback URL:     ${mpesaConfig.callbackUrl}`);
console.log(`   Is Sandbox:       ${isSandbox}`);
console.log('═══════════════════════════════════════════');

import axios from 'axios';
import { mpesaConfig } from '../config/mpesa.js';
import { getAccessToken } from './auth.js';
import Logger from '../utils/logger.js';

/**
 * Initiate M-Pesa STK Push
 * Works for ALL origins: marketplace, billing, wallet
 */
export const initiateStkPush = async (phoneNumber, amount, accountReference, transactionDesc, origin = 'wallet') => {
  Logger.info(`[STK Push] Starting | Phone: ${phoneNumber} | Amount: ${amount} | Origin: ${origin}`);

  // 1. Get Daraja access token
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Failed to obtain M-Pesa access token');
  }
  Logger.info(`[STK Push] Token acquired (${token.substring(0, 12)}...)`);

  // 2. Use pre-resolved config values (sandbox/production already handled in mpesa.js)
  const { baseUrl, shortCode, transactionType, passKey, callbackUrl } = mpesaConfig;

  // PartyB: for BuyGoods it's the till, for PayBill it's the shortcode
  const partyB = mpesaConfig.isBuyGoods ? mpesaConfig.tillNumber : shortCode;

  // 3. Generate timestamp and password
  const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
  // Password is ALWAYS: Base64(ShortCode + PassKey + Timestamp)
  // For sandbox, shortCode is 174379. For production, it's whatever is configured.
  const password = Buffer.from(`${shortCode}${passKey}${timestamp}`).toString('base64');

  // 4. Format phone number to 2547XXXXXXXX
  let formattedPhone = String(phoneNumber).replace(/[\s\+\-]/g, '');
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '254' + formattedPhone.substring(1);
  } else if (formattedPhone.startsWith('7') || formattedPhone.startsWith('1')) {
    formattedPhone = '254' + formattedPhone;
  } else if (!formattedPhone.startsWith('254')) {
    Logger.warn(`[STK Push] Phone format uncertain: ${phoneNumber}`);
  }

  // 5. Build request body
  const requestBody = {
    BusinessShortCode: shortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: transactionType,
    Amount: Math.round(Number(amount)),
    PartyA: formattedPhone,
    PartyB: partyB,
    PhoneNumber: formattedPhone,
    CallBackURL: `${callbackUrl}?origin=${origin || 'wallet'}`,
    AccountReference: accountReference || mpesaConfig.accountReference,
    TransactionDesc: transactionDesc || mpesaConfig.transactionDesc,
  };

  // 6. Log full request details
  Logger.info(`📋 [STK Push] Config Summary:`);
  Logger.info(`   Environment:      ${mpesaConfig.environment}`);
  Logger.info(`   TransactionType:  ${transactionType}`);
  Logger.info(`   BusinessShortCode:${shortCode}`);
  Logger.info(`   PartyB:           ${partyB}`);
  Logger.info(`   Amount:           ${requestBody.Amount}`);
  Logger.info(`   Origin:           ${origin}`);
  Logger.info(`   CallBackURL:      ${requestBody.CallBackURL}`);

  // 7. Send to Safaricom
  try {
    const targetUrl = `${baseUrl}/mpesa/stkpush/v1/processrequest`;
    Logger.info(`🚀 [STK Push] POST → ${targetUrl}`);

    const response = await axios.post(targetUrl, requestBody, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 25000
    });

    Logger.info(`✅ [STK Push] Success! Response:`, JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    const errorData = error.response?.data || error.message;
    Logger.error(`❌ [STK Push] FAILED: ${JSON.stringify(errorData)}`);

    if (error.response?.data?.errorCode === '404.001.03') {
      Logger.error('💀 [STK Push] INVALID ACCESS TOKEN — credentials and URL environment are mismatched');
    }
    if (error.response?.data?.errorCode === '400.002.02') {
      Logger.error(`💀 [STK Push] INVALID TRANSACTION TYPE — sent "${transactionType}" to ${baseUrl}`);
      Logger.error(`💀 [STK Push] Sandbox ONLY accepts "CustomerPayBillOnline" with shortcode 174379`);
    }

    throw new Error(error.response?.data?.errorMessage || 'Failed to initiate STK Push');
  }
};

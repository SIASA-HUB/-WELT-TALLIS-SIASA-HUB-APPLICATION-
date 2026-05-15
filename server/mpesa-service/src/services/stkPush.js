import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { mpesaConfig } from '../config/mpesa.js';
import { getAccessToken } from './auth.js';
import Logger from '../utils/logger.js';

const debugLog = (msg) => {
  Logger.info(`[DEBUGLOG] ${msg}`);
};

/**
 * Initiate M-Pesa STK Push
 */
export const initiateStkPush = async (phoneNumber, amount, accountReference, transactionDesc, origin = 'wallet') => {
  debugLog(`[STK Push] Starting request for ${phoneNumber}, Amount: ${amount}`);
  const token = await getAccessToken();
  if (!token) {
    debugLog('[STK Push] Error: Access token is undefined after getAccessToken call!');
    throw new Error('Failed to obtain M-Pesa access token');
  }
  debugLog(`[STK Push] Using token (start): ${token.substring(0, 10)}...`);
  const { baseUrl, shortCode, tillNumber, passKey, callbackUrl } = mpesaConfig;

  const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
  const password = Buffer.from(`${shortCode}${passKey}${timestamp}`).toString('base64');

  // Format phone number to 2547XXXXXXXX
  let formattedPhone = phoneNumber.replace(/\s/g, '');
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '254' + formattedPhone.substring(1);
  } else if (formattedPhone.startsWith('+')) {
    formattedPhone = formattedPhone.substring(1);
  }

  const isBuyGoods = !!tillNumber;

  const requestBody = {
    BusinessShortCode: shortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: isBuyGoods ? 'CustomerBuyGoodsOnline' : 'CustomerPayBillOnline',
    Amount: Math.round(amount),
    PartyA: formattedPhone,
    PartyB: isBuyGoods ? tillNumber : shortCode,
    PhoneNumber: formattedPhone,
    CallBackURL: `${callbackUrl}?origin=${origin}`,
    AccountReference: accountReference || mpesaConfig.accountReference,
    TransactionDesc: transactionDesc || mpesaConfig.transactionDesc,
  };

  debugLog(`[STK Push] Body: ${JSON.stringify(requestBody)}`);

  try {
    const targetUrl = `${baseUrl}/mpesa/stkpush/v1/processrequest`;
    Logger.info(`🚀 [STK Push] Calling: ${targetUrl}`);
    Logger.info(`🔑 [STK Push] Token (start): ${token.substring(0, 20)}...`);
    Logger.info(`📦 [STK Push] Request Body:`, JSON.stringify(requestBody, null, 2));

    const response = await axios.post(
      targetUrl,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    Logger.info(`✅ [STK Push] Success!`, JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    const errorData = error.response?.data || error.message;
    Logger.error(`[STK Push] Error: ${JSON.stringify(errorData)}`);
    throw new Error(error.response?.data?.errorMessage || 'Failed to initiate STK Push');
  }
};

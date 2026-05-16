import axios from 'axios';
import { mpesaConfig } from '../config/mpesa.js';
import { getAccessToken } from './auth.js';
import { updateTransactionStatus } from './transactionService.js';
import Logger from '../utils/logger.js';

/**
 * Query STK Push transaction status from Safaricom
 * Used for polling when callbacks can't reach the server (e.g., localhost dev)
 */
export const queryStkStatus = async (checkoutRequestId) => {
  Logger.info(`🔍 [STK Query] Checking status for: ${checkoutRequestId}`);

  const token = await getAccessToken();
  if (!token) {
    throw new Error('Failed to obtain M-Pesa access token');
  }

  const { baseUrl, shortCode, passKey } = mpesaConfig;
  const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
  const password = Buffer.from(`${shortCode}${passKey}${timestamp}`).toString('base64');

  const requestBody = {
    BusinessShortCode: shortCode,
    Password: password,
    Timestamp: timestamp,
    CheckoutRequestID: checkoutRequestId,
  };

  try {
    const response = await axios.post(
      `${baseUrl}/mpesa/stkpushquery/v1/query`,
      requestBody,
      {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 15000,
      }
    );

    const { ResultCode, ResultDesc } = response.data;
    Logger.info(`🔍 [STK Query] Result: Code=${ResultCode}, Desc="${ResultDesc}"`);

    let status = 'pending';
    if (ResultCode === '0' || ResultCode === 0) {
      status = 'completed';
      // Update our local DB
      await updateTransactionStatus(checkoutRequestId, 'completed', null, ResultDesc);
    } else if (ResultCode === '1032' || ResultCode === 1032) {
      status = 'cancelled';
      await updateTransactionStatus(checkoutRequestId, 'failed', null, 'Request cancelled by user');
    } else if (ResultCode !== undefined && ResultCode !== null) {
      status = 'failed';
      await updateTransactionStatus(checkoutRequestId, 'failed', null, ResultDesc);
    }

    return {
      success: true,
      status,
      resultCode: ResultCode,
      resultDesc: ResultDesc,
      checkoutRequestId,
    };
  } catch (error) {
    const errorData = error.response?.data || {};
    
    // Safaricom returns specific error codes for pending transactions
    if (errorData.errorCode === '500.001.1001') {
      // "The transaction is being processed" — still pending
      return {
        success: true,
        status: 'pending',
        resultDesc: 'Transaction is still being processed',
        checkoutRequestId,
      };
    }

    Logger.error(`❌ [STK Query] Error: ${JSON.stringify(errorData)}`);
    throw new Error(errorData.errorMessage || error.message || 'Failed to query status');
  }
};

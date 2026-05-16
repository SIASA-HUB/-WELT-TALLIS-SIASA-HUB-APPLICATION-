import axios from 'axios';
import { updateTransactionStatus, getTransaction } from './transactionService.js';
import Logger from '../utils/logger.js';

/**
 * Handle M-Pesa STK Push Callback
 */
export const processCallback = async (callbackData, origin = 'wallet') => {
  const { Body } = callbackData;
  
  if (!Body || !Body.stkCallback) {
    throw new Error('Invalid callback data');
  }

  const { ResultCode, ResultDesc, CallbackMetadata, CheckoutRequestID } = Body.stkCallback;

  if (ResultCode === 0) {
    const metadata = CallbackMetadata.Item;
    const amount = metadata.find(item => item.Name === 'Amount')?.Value;
    const mpesaReceiptNumber = metadata.find(item => item.Name === 'MpesaReceiptNumber')?.Value;
    const transactionDate = metadata.find(item => item.Name === 'TransactionDate')?.Value;
    const phoneNumber = metadata.find(item => item.Name === 'PhoneNumber')?.Value;

    Logger.info(`✅ Payment Success: ${mpesaReceiptNumber} - ${amount} from ${phoneNumber}`);
    
    // Get pending transaction to retrieve the original order_id/reference
    const pendingTx = await getTransaction(CheckoutRequestID);
    const accountReference = pendingTx?.order_id || pendingTx?.transaction_id;

    // Update DB
    await updateTransactionStatus(CheckoutRequestID, 'completed', mpesaReceiptNumber, ResultDesc);

    // Notify the origin service
    await notifyService(origin, {
      checkoutRequestId: CheckoutRequestID,
      accountReference,
      receipt: mpesaReceiptNumber,
      amount,
      phoneNumber,
      date: transactionDate,
      status: 'completed',
      type: pendingTx?.payment_type
    });
    
    return { success: true, message: 'Payment processed successfully' };
  } else {
    console.log(`❌ Payment Failed: ${ResultDesc} (Code: ${ResultCode})`);
    
    // Update DB
    await updateTransactionStatus(CheckoutRequestID, 'failed', null, ResultDesc);

    await notifyService(origin, {
      checkoutRequestId: CheckoutRequestID,
      status: 'failed',
      message: ResultDesc
    });
    
    return { success: false, message: ResultDesc };
  }
};

/**
 * Notify the originating service about the payment status
 */
const notifyService = async (origin, data) => {
  const serviceUrls = {
    wallet: process.env.WALLET_SERVICE_URL || 'http://wallet-service:8008/api/v1/wallet/mpesa/internal-callback',
    marketplace: process.env.MARKETPLACE_SERVICE_URL || 'http://marketplace-service:8004/api/v1/marketplace/payments/callback',
    billing: process.env.LEADERS_SERVICE_URL || 'http://leaders-service:8006/api/v1/leaders/payments/callback',
    boost: process.env.LEADERS_SERVICE_URL || 'http://leaders-service:8006/api/v1/leaders/boost/callback'
  };

  const url = serviceUrls[origin];
  if (url) {
    try {
      await axios.post(url, data, {
        headers: { 'X-Internal-Secret': process.env.INTERNAL_SERVICE_SECRET || 'siasa-secret' }
      });
      console.log(`📡 Successfully notified ${origin} service`);
    } catch (error) {
      console.error(`❌ Failed to notify ${origin} service:`, error.message);
    }
  }
};

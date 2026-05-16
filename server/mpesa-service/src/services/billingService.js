import { recordTransaction } from './transactionService.js';
import { initiateStkPush } from './stkPush.js';
import Logger from '../utils/logger.js';

/**
 * Handle Billing Requests from ALL origins (marketplace, billing, wallet)
 * This is the single entry point for all STK Push requests
 */
export const initiateBilling = async (data) => {
  const {
    userId,
    phoneNumber,
    amount,
    type = 'payment',
    aspirantId,
    orderId,
    origin = 'wallet',
    accountReference: customRef,
    transactionDesc: customDesc
  } = data;

  if (!phoneNumber) throw new Error('Phone number is required');
  if (!amount || Number(amount) < 1) throw new Error('Valid amount is required');

  Logger.info(`💰 [Billing] Initiating | User: ${userId} | Amount: ${amount} | Type: ${type} | Origin: ${origin}`);

  try {
    // Build account reference and description
    const accountReference = customRef
      || (type === 'wallet' ? `WALLET-${(userId || 'ANON').substring(0, 8)}` : null)
      || (orderId ? `ORDER-${orderId}` : null)
      || `BILL-${Date.now()}`;

    const transactionDesc = customDesc
      || (type === 'wallet' ? 'SiasaHub Wallet Top-up' : null)
      || (type === 'order' || type === 'marketplace' ? `SiasaHub marketplace order` : null)
      || (type === 'billing' ? 'SiasaHub billing payment' : null)
      || `SiasaHub ${type} payment`;

    // Initiate STK Push
    const stkResponse = await initiateStkPush(phoneNumber, amount, accountReference, transactionDesc, origin);

    if (stkResponse.ResponseCode === '0') {
      // Record pending transaction (non-blocking — don't crash if DB fails)
      try {
        await recordTransaction({
          transactionId: stkResponse.CheckoutRequestID,
          phoneNumber,
          amount,
          type,
          aspirantId,
          orderId,
          status: 'pending',
          message: 'STK Push initiated'
        });
      } catch (dbErr) {
        Logger.warn(`⚠️ [Billing] Failed to record transaction (non-fatal): ${dbErr.message}`);
      }

      return {
        success: true,
        checkoutRequestId: stkResponse.CheckoutRequestID,
        message: stkResponse.CustomerMessage || 'STK Push sent. Check your phone.',
        data: {
          checkoutRequestId: stkResponse.CheckoutRequestID,
          CheckoutRequestID: stkResponse.CheckoutRequestID,
        }
      };
    }

    throw new Error(stkResponse.ResponseDescription || 'Failed to initiate payment');
  } catch (error) {
    Logger.error(`❌ [Billing] Error: ${error.message}`);
    throw error;
  }
};

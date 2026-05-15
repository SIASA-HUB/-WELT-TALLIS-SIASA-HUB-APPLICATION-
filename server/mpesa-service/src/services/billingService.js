import { recordTransaction } from './transactionService.js';
import { initiateStkPush } from './stkPush.js';

/**
 * Handle Billing Requests (SaaS Model)
 */
export const initiateBilling = async (data) => {
  const { userId, phoneNumber, amount, type, aspirantId, orderId } = data;

  try {
    const accountReference = type === 'wallet' ? `WALLET-${userId.substring(0, 8)}` : (orderId || `BILL-${Date.now()}`);
    const transactionDesc = `SiasaHub ${type} payment`;

    // 1. Record pending transaction
    const stkResponse = await initiateStkPush(phoneNumber, amount, accountReference, transactionDesc, type);
    
    if (stkResponse.ResponseCode === '0') {
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
      
      return {
        success: true,
        checkoutRequestId: stkResponse.CheckoutRequestID,
        message: stkResponse.CustomerMessage
      };
    }
    
    throw new Error(stkResponse.ResponseDescription || 'Failed to initiate payment');
  } catch (error) {
    console.error('❌ Billing Initiation Error:', error.message);
    throw error;
  }
};

import { initiateBilling, handleMpesaWebhook, initiateB2B } from '../services/index.js';

/**
 * Handle STK Push Request from other services
 */
export const stkPushRequest = async (req, res) => {
  console.log('[M-Pesa Controller] STK Push Request:', JSON.stringify(req.body, null, 2));
  try {
    const result = await initiateBilling(req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error('[M-Pesa Controller] STK Push Error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Handle B2B Payment Request
 */
export const b2bPaymentRequest = async (req, res) => {
  try {
    const result = await initiateB2B(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Handle Callback from M-Pesa
 */
export const handleCallback = async (req, res) => {
  await handleMpesaWebhook(req, res);
};

/**
 * Query Transaction Status
 */
export const queryTransactionStatus = async (req, res) => {
  const { checkoutRequestId } = req.params;

  if (!checkoutRequestId) {
    return res.status(400).json({ success: false, message: 'CheckoutRequestID is required' });
  }

  // TODO: Implement Safaricom status query logic if needed
  res.status(501).json({ success: false, message: 'Not implemented yet' });
};

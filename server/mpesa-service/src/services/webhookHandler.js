import { processCallback } from './callbacks.js';

/**
 * Main Webhook Handler for M-Pesa
 */
export const handleMpesaWebhook = async (req, res) => {
  const origin = req.query.origin || 'wallet';

  try {
    const result = await processCallback(req.body, origin);
    res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (error) {
    console.error('Webhook Error:', error.message);
    res.status(200).json({ ResultCode: 1, ResultDesc: 'Failed' });
  }
};

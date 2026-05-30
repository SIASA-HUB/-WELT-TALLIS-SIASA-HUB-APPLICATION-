import { initiateStkPush } from '../services/stkPush.js';
import { handleMpesaWebhook } from '../services/webhookHandler.js';
import { getLedgerHistory, getLatestEvent } from '../services/ledger.js';
import Logger from '../utils/logger.js';

export const stkPushRequest = async (req, res) => {
  Logger.info('[Controller] STK Push request:', req.body);
  try {
    const result = await initiateStkPush(req.body);
    res.status(200).json(result);
  } catch (err) {
    Logger.error('[Controller] STK Push error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const handleCallback = async (req, res) => {
  await handleMpesaWebhook(req, res);
};

export const getPaymentHistory = async (req, res) => {
  const { checkoutRequestId } = req.params;
  if (!checkoutRequestId) return res.status(400).json({ success: false, message: 'checkoutRequestId required' });

  try {
    const history = await getLedgerHistory(checkoutRequestId);
    const latest  = history.at(-1);
    res.status(200).json({ success: true, status: latest?.event || 'unknown', history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
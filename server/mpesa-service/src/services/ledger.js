import db from '../config/db.js';
import Logger from '../utils/logger.js';

/**
 * Append an event to the payment ledger.
 * This is the ONLY write path — no updates, no deletes.
 */
export const appendLedger = async (entry) => {
  const {
    checkoutRequestId,
    event,                 // 'initiated' | 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded'
    phoneNumber,
    amount,
    paymentType,
    accountReference,
    userId,
    orderId,
    aspirantId,
    merchantRequestId,
    mpesaReceiptNumber,
    resultCode,
    resultDesc,
  } = entry;

  try {
    await db('payment_ledger').insert({
      checkout_request_id:  checkoutRequestId,
      event,
      phone_number:         phoneNumber,
      amount,
      payment_type:         paymentType  || 'payment',
      account_reference:    accountReference || null,
      user_id:              userId       || null,
      order_id:             orderId      || null,
      aspirant_id:          aspirantId   || null,
      merchant_request_id:  merchantRequestId    || null,
      mpesa_receipt_number: mpesaReceiptNumber   || null,
      result_code:          resultCode   ?? null,
      result_desc:          resultDesc   || null,
    });

    Logger.info(`[Ledger] ${event.toUpperCase()} — ${checkoutRequestId}`);
  } catch (err) {
    // Non-fatal: log but don't crash the payment flow
    Logger.warn(`[Ledger] Failed to append (${event}): ${err.message}`);
  }
};

/**
 * Get the full history of a payment by checkout request ID.
 */
export const getLedgerHistory = async (checkoutRequestId) => {
  try {
    return await db('payment_ledger')
      .where({ checkout_request_id: checkoutRequestId })
      .orderBy('created_at', 'asc');
  } catch (err) {
    Logger.warn(`[Ledger] Could not read history: ${err.message}`);
    return [];
  }
};

/**
 * Get the latest event for a payment (current "status").
 */
export const getLatestEvent = async (checkoutRequestId) => {
  try {
    return await db('payment_ledger')
      .where({ checkout_request_id: checkoutRequestId })
      .orderBy('created_at', 'desc')
      .first();
  } catch (err) {
    Logger.warn(`[Ledger] Could not get latest event: ${err.message}`);
    return null;
  }
};
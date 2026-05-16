import db from '../config/db.js';
import Logger from '../utils/logger.js';

/**
 * Record a payment transaction in the database
 * Non-fatal: if DB is unavailable, logs warning but doesn't crash
 */
export const recordTransaction = async (data) => {
  const {
    transactionId,
    phoneNumber,
    amount,
    type,
    aspirantId,
    orderId,
    status,
    receiptNumber,
    message
  } = data;

  try {
    await db('payments').insert({
      transaction_id: transactionId,
      phone_number: phoneNumber,
      amount: amount,
      payment_type: type || 'payment',
      aspirant_id: aspirantId || null,
      order_id: orderId || null,
      status: status || 'pending',
      receipt_number: receiptNumber || null,
      message: message || null,
      created_at: new Date(),
      updated_at: new Date()
    });
    Logger.info(`✅ [TX] Recorded: ${transactionId} | Status: ${status} | Amount: ${amount}`);
  } catch (error) {
    // Non-fatal: table might not exist yet, or DB might be down
    Logger.warn(`⚠️ [TX] Could not record transaction ${transactionId}: ${error.message}`);
  }
};

/**
 * Get transaction by ID
 */
export const getTransaction = async (transactionId) => {
  try {
    return await db('payments').where({ transaction_id: transactionId }).first();
  } catch (error) {
    Logger.warn(`⚠️ [TX] Could not get transaction ${transactionId}: ${error.message}`);
    return null;
  }
};

/**
 * Update transaction status
 */
export const updateTransactionStatus = async (transactionId, status, receiptNumber, message) => {
  try {
    await db('payments')
      .where({ transaction_id: transactionId })
      .update({
        status: status,
        receipt_number: receiptNumber || null,
        message: message || null,
        updated_at: new Date()
      });
    Logger.info(`🔄 [TX] Updated: ${transactionId} → ${status}`);
  } catch (error) {
    Logger.warn(`⚠️ [TX] Could not update transaction ${transactionId}: ${error.message}`);
  }
};

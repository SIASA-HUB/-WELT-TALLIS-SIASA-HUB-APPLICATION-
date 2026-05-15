import db from '../config/db.js';

/**
 * Record a payment transaction in the database
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
      payment_type: type, // 'wallet', 'marketplace', 'boost'
      aspirant_id: aspirantId,
      order_id: orderId,
      status: status, // 'pending', 'completed', 'failed'
      receipt_number: receiptNumber,
      message: message,
      created_at: new Date(),
      updated_at: new Date()
    });
    console.log(`✅ Transaction recorded: ${transactionId}`);
  } catch (error) {
    console.error('❌ Error recording transaction:', error.message);
  }
};

/**
 * Get transaction by ID
 */
export const getTransaction = async (transactionId) => {
  try {
    return await db('payments').where({ transaction_id: transactionId }).first();
  } catch (error) {
    console.error('❌ Error getting transaction:', error.message);
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
        receipt_number: receiptNumber,
        message: message,
        updated_at: new Date()
      });
    console.log(`🔄 Transaction updated: ${transactionId} -> ${status}`);
  } catch (error) {
    console.error('❌ Error updating transaction status:', error.message);
  }
};

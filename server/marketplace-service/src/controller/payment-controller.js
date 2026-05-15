const axios = require("axios");
const { safeQuery, safeQueryOne } = require("../configurations/db");
const Logger = require("../utils/logger/logger");

const MPESA_SERVICE_URL = process.env.MPESA_SERVICE_URL || 'http://mpesa-service:8010/api/v1/mpesa';
const INTERNAL_SERVICE_SECRET = process.env.INTERNAL_SERVICE_SECRET || 'siasa-secret';

/**
 * Initiate M-Pesa Payment for an Order
 */
const initiateMpesaPayment = async (req, res) => {
  const { orderId, phoneNumber } = req.body;

  if (!orderId || !phoneNumber) {
    return res.status(400).json({ success: false, message: "Order ID and Phone Number are required" });
  }

  try {
    const order = await safeQueryOne(`SELECT * FROM orders WHERE id = ?`, [orderId]);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Call mpesa-service
    const response = await axios.post(`${MPESA_SERVICE_URL}/stkpush`, {
      phoneNumber,
      amount: order.total_amount,
      accountReference: order.order_number,
      transactionDesc: `Payment for Order ${order.order_number}`,
      origin: "marketplace"
    });

    if (response.data?.success) {
      const { checkoutRequestId } = response.data.data;
      
      // Update order with checkoutRequestId
      await safeQuery(
        `UPDATE orders SET mpesa_checkout_id = ?, updated_at = NOW() WHERE id = ?`,
        [checkoutRequestId, orderId]
      );
      
      return res.json({
        success: true,
        message: "M-Pesa payment initiated",
        data: { checkoutRequestId }
      });
    }
    
    throw new Error(response.data?.message || "Failed to initiate M-Pesa payment");
  } catch (error) {
    Logger.error("M-Pesa Payment Initiation Error:", error.response?.data?.message || error.message);
    res.status(500).json({ success: false, message: error.response?.data?.message || error.message });
  }
};

/**
 * Handle internal callback from mpesa-service
 */
const handleInternalCallback = async (req, res) => {
  const secret = req.headers['x-internal-secret'];
  if (secret !== INTERNAL_SERVICE_SECRET) {
    Logger.warn(`⛔ Rejected internal callback from unauthorized source`);
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const { checkoutRequestId, status, receipt, amount, message } = req.body;
  Logger.info(`🔔 [Marketplace] Internal Payment Callback: ${checkoutRequestId}, Status: ${status}`);

  try {
    const order = await safeQueryOne(
      `SELECT * FROM orders WHERE mpesa_checkout_id = ?`,
      [checkoutRequestId]
    );
    
    if (!order) {
      Logger.warn(`Order not found for checkoutId: ${checkoutRequestId}`);
      return res.status(200).json({ success: true });
    }

    if (status === 'completed') {
      await safeQuery(
        `UPDATE orders SET status = 'paid', mpesa_receipt = ?, updated_at = NOW() WHERE id = ?`,
        [receipt || '', order.id]
      );
      Logger.info(`✅ Order ${order.order_number} marked as PAID`);
      
      // We could also trigger inventory updates here
    } else {
      await safeQuery(
        `UPDATE orders SET status = 'failed', updated_at = NOW() WHERE id = ?`,
        [order.id]
      );
      Logger.warn(`❌ Payment failed for Order ${order.order_number}: ${message}`);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    Logger.error('Internal callback error in marketplace:', error);
    res.status(500).json({ success: false });
  }
};

/**
 * Get payment status for polling
 */
const getPaymentStatus = async (req, res) => {
  const { checkoutId } = req.params;
  try {
    const order = await safeQueryOne(
      `SELECT id, order_number, status FROM orders WHERE mpesa_checkout_id = ?`,
      [checkoutId]
    );
    
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({ 
      success: true, 
      status: order.status, // 'pending_payment', 'paid', 'failed'
      orderNumber: order.order_number
    });
  } catch (error) {
    Logger.error('Error fetching payment status:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  initiateMpesaPayment,
  handleInternalCallback,
  getPaymentStatus
};

const axios = require("axios");
const { safeQuery, safeQueryOne } = require("../configurations/db");
const Logger = require("../utils/logger/logger");

const MPESA_SERVICE_URL = process.env.MPESA_SERVICE_URL || 'http://localhost:8011/api/v1/mpesa';
const INTERNAL_SERVICE_SECRET = process.env.INTERNAL_SERVICE_SECRET || 'siasahub_internal_secret_2026';

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

    Logger.info(`💳 [Marketplace] Initiating M-Pesa for Order ${order.order_number}, Amount: ${order.total_amount}`);

    // Call mpesa-service with internal secret for authorization
    const response = await axios.post(`${MPESA_SERVICE_URL}/stkpush`, {
      phoneNumber,
      amount: order.total_amount,
      accountReference: order.order_number,
      transactionDesc: `Payment for Order ${order.order_number}`,
      origin: "marketplace",
      type: "order",
      orderId: order.id
    }, {
      headers: {
        'x-internal-secret': INTERNAL_SERVICE_SECRET
      },
      timeout: 30000
    });

    if (response.data?.success) {
      const checkoutRequestId = response.data.checkoutRequestId 
        || response.data.data?.checkoutRequestId 
        || response.data.data?.CheckoutRequestID;
      
      // Try to save checkoutRequestId — column might not exist yet
      if (checkoutRequestId) {
        try {
          await safeQuery(
            `UPDATE orders SET mpesa_checkout_id = ?, status = 'pending_payment', updated_at = NOW() WHERE id = ?`,
            [checkoutRequestId, orderId]
          );
        } catch (colErr) {
          // If mpesa_checkout_id column doesn't exist, just update status
          Logger.warn(`⚠️ Could not save checkout ID (column may not exist yet): ${colErr.message}`);
          try {
            await safeQuery(`UPDATE orders SET status = 'pending_payment', updated_at = NOW() WHERE id = ?`, [orderId]);
          } catch (e) {
            Logger.warn(`⚠️ Could not update order status: ${e.message}`);
          }
        }
      }
      
      return res.json({
        success: true,
        message: "M-Pesa payment initiated. Check your phone.",
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
  Logger.info(`🔔 [Marketplace] Payment Callback: ${checkoutRequestId}, Status: ${status}`);

  try {
    // Try to find by mpesa_checkout_id first, fallback to order_number
    let order = null;
    try {
      order = await safeQueryOne(`SELECT * FROM orders WHERE mpesa_checkout_id = ?`, [checkoutRequestId]);
    } catch (e) {
      // mpesa_checkout_id column might not exist — try by most recent pending order
      Logger.warn(`⚠️ Could not query by mpesa_checkout_id: ${e.message}`);
    }
    
    if (!order) {
      Logger.warn(`Order not found for checkoutId: ${checkoutRequestId}`);
      return res.status(200).json({ success: true });
    }

    if (status === 'completed') {
      try {
        await safeQuery(
          `UPDATE orders SET status = 'paid', mpesa_receipt = ?, updated_at = NOW() WHERE id = ?`,
          [receipt || '', order.id]
        );
      } catch (e) {
        // mpesa_receipt column might not exist
        await safeQuery(`UPDATE orders SET status = 'paid', updated_at = NOW() WHERE id = ?`, [order.id]);
      }
      Logger.info(`✅ Order ${order.order_number} marked as PAID`);
    } else {
      await safeQuery(`UPDATE orders SET status = 'failed', updated_at = NOW() WHERE id = ?`, [order.id]);
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
    let order = null;
    try {
      order = await safeQueryOne(
        `SELECT id, order_number, status FROM orders WHERE mpesa_checkout_id = ?`,
        [checkoutId]
      );
    } catch (e) {
      Logger.warn(`⚠️ Could not query by mpesa_checkout_id: ${e.message}`);
    }
    
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // If still pending, actively check the real status via M-Pesa service
    // This is especially important for local dev where callbacks don't reach us
    if (order.status === 'pending' || order.status === 'pending_payment') {
      try {
        const statusRes = await axios.get(`${MPESA_SERVICE_URL}/status/${checkoutId}`);
        if (statusRes.data?.success) {
          const realStatus = statusRes.data.status;
          
          if (realStatus === 'completed') {
            await safeQuery(`UPDATE orders SET status = 'paid', updated_at = NOW() WHERE id = ?`, [order.id]);
            order.status = 'paid';
          } else if (realStatus === 'failed' || realStatus === 'cancelled') {
            await safeQuery(`UPDATE orders SET status = 'failed', updated_at = NOW() WHERE id = ?`, [order.id]);
            order.status = 'failed';
          }
        }
      } catch (e) {
        Logger.warn(`⚠️ Could not query live M-Pesa status: ${e.message}`);
      }
    }

    res.json({ 
      success: true, 
      status: order.status,
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

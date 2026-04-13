// orderController.js - Complete with get by ID and user orders

const { safeQuery, safeQueryOne } = require("../configurations/db");
const Logger = require("../utils/logger/logger");

const generateOrderNumber = () => {
  return "SH-ORD-" + Math.random().toString(36).substr(2, 9).toUpperCase();
};

const placeOrder = async (req, res) => {
  try {
    const { userId, guestName, guestEmail, guestPhone, address, totalAmount, items } = req.body;

    const orderNumber = generateOrderNumber();

    const result = await safeQuery(
      `INSERT INTO orders (order_number, user_id, customer_name, customer_email, customer_phone, address, total_amount, items, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW())`,
      [
        orderNumber,
        userId || null,
        guestName || "Guest",
        guestEmail,
        guestPhone || "",
        address,
        totalAmount,
        JSON.stringify(items),
      ]
    );

    // Get the created order
    const newOrder = await safeQueryOne(
      `SELECT * FROM orders WHERE id = ?`,
      [result.insertId]
    );

    // Parse items JSON
    if (newOrder && newOrder.items) {
      newOrder.items = typeof newOrder.items === 'string' ? JSON.parse(newOrder.items) : newOrder.items;
    }

    res.json({
      success: true,
      message: "Order placed successfully",
      data: newOrder,
    });
  } catch (error) {
    Logger.error("Error placing order:", error);
    res.status(500).json({ success: false, message: "Error placing order: " + error.message });
  }
};

// Get order by ID (for user to view their order)
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await safeQueryOne(
      `SELECT * FROM orders WHERE id = ?`,
      [id]
    );

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Parse items JSON
    if (order.items) {
      order.items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
    }

    res.json({ success: true, data: order });
  } catch (error) {
    Logger.error("Error fetching order by ID:", error);
    res.status(500).json({ success: false, message: "Error fetching order" });
  }
};

// Get order by order number (for user to track)
const getOrderByNumber = async (req, res) => {
  try {
    const { orderNumber } = req.params;
    
    const order = await safeQueryOne(
      `SELECT * FROM orders WHERE order_number = ?`,
      [orderNumber]
    );

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Parse items JSON
    if (order.items) {
      order.items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
    }

    res.json({ success: true, data: order });
  } catch (error) {
    Logger.error("Error fetching order by number:", error);
    res.status(500).json({ success: false, message: "Error fetching order" });
  }
};

// Get all orders for a specific user
const getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const orders = await safeQuery(
      `SELECT * FROM orders 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [userId, parseInt(limit), parseInt(offset)]
    );

    // Parse items JSON for each order
    const formattedOrders = orders.map(order => ({
      ...order,
      items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items
    }));

    // Get total count
    const countResult = await safeQueryOne(
      `SELECT COUNT(*) as total FROM orders WHERE user_id = ?`,
      [userId]
    );

    res.json({
      success: true,
      data: formattedOrders,
      pagination: {
        total: countResult?.total || 0,
        limit: parseInt(limit),
        offset: parseInt(offset),
      }
    });
  } catch (error) {
    Logger.error("Error fetching user orders:", error);
    res.status(500).json({ success: false, message: "Error fetching orders" });
  }
};

// Get guest orders by email
const getGuestOrders = async (req, res) => {
  try {
    const { email, phone } = req.query;
    
    if (!email && !phone) {
      return res.status(400).json({ success: false, message: "Email or phone is required" });
    }
    
    let query = `SELECT * FROM orders WHERE customer_email = ?`;
    let params = [email];
    
    if (phone && !email) {
      query = `SELECT * FROM orders WHERE customer_phone = ?`;
      params = [phone];
    }
    
    const orders = await safeQuery(query, params);

    // Parse items JSON for each order
    const formattedOrders = orders.map(order => ({
      ...order,
      items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items
    }));

    res.json({ success: true, data: formattedOrders });
  } catch (error) {
    Logger.error("Error fetching guest orders:", error);
    res.status(500).json({ success: false, message: "Error fetching orders" });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    
    const orders = await safeQuery(
      `SELECT * FROM orders ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [parseInt(limit), parseInt(offset)]
    );

    // Parse items JSON for each order
    const formattedOrders = orders.map(order => ({
      ...order,
      items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items
    }));

    // Get total count
    const countResult = await safeQueryOne(`SELECT COUNT(*) as total FROM orders`);

    res.json({
      success: true,
      data: formattedOrders,
      pagination: {
        total: countResult?.total || 0,
        limit: parseInt(limit),
        offset: parseInt(offset),
      }
    });
  } catch (error) {
    Logger.error("Error fetching orders:", error);
    res.status(500).json({ success: false, message: "Error fetching orders" });
  }
};

const getOrderStats = async (req, res) => {
  try {
    const stats = await safeQueryOne(
      `SELECT 
        COUNT(*) as totalOrders, 
        COALESCE(SUM(total_amount), 0) as totalRevenue,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pendingOrders,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completedOrders,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelledOrders
       FROM orders`,
      []
    );

    res.json({
      success: true,
      data: {
        totalOrders: stats.totalOrders || 0,
        totalRevenue: stats.totalRevenue || 0,
        pendingOrders: stats.pendingOrders || 0,
        completedOrders: stats.completedOrders || 0,
        cancelledOrders: stats.cancelledOrders || 0
      }
    });
  } catch (error) {
    Logger.error("Error fetching order stats:", error);
    res.status(500).json({ success: false, message: "Error fetching order stats" });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "processed", "shipped", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    // Check if order exists
    const order = await safeQueryOne(`SELECT id FROM orders WHERE id = ?`, [id]);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    await safeQuery(
      `UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?`,
      [status, id]
    );

    const updatedOrder = await safeQueryOne(`SELECT * FROM orders WHERE id = ?`, [id]);
    
    // Parse items JSON
    if (updatedOrder && updatedOrder.items) {
      updatedOrder.items = typeof updatedOrder.items === 'string' ? JSON.parse(updatedOrder.items) : updatedOrder.items;
    }

    res.json({
      success: true,
      message: "Order status updated",
      data: updatedOrder
    });
  } catch (error) {
    Logger.error("Error updating order status:", error);
    res.status(500).json({ success: false, message: "Error updating order status" });
  }
};

// Cancel order (user cancels their own order)
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    // Check if order exists and belongs to user
    const order = await safeQueryOne(
      `SELECT id, status, user_id FROM orders WHERE id = ? AND (user_id = ? OR user_id IS NULL)`,
      [id, userId]
    );
    
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    
    if (order.status !== "pending") {
      return res.status(400).json({ success: false, message: "Only pending orders can be cancelled" });
    }
    
    await safeQuery(
      `UPDATE orders SET status = 'cancelled', updated_at = NOW() WHERE id = ?`,
      [id]
    );
    
    res.json({ success: true, message: "Order cancelled successfully" });
  } catch (error) {
    Logger.error("Error cancelling order:", error);
    res.status(500).json({ success: false, message: "Error cancelling order" });
  }
};

// Direct single-product order (skip cart)
const directOrder = async (req, res) => {
  try {
    const { userId, productId, quantity = 1, address, guestName, guestEmail, guestPhone, totalAmount } = req.body;
    const orderNumber = generateOrderNumber();
    const items = JSON.stringify([{ productId, quantity, price: totalAmount }]);

    const result = await safeQuery(
      `INSERT INTO orders (order_number, user_id, customer_name, customer_email, customer_phone, address, total_amount, items, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW())`,
      [orderNumber, userId || null, guestName || 'Guest', guestEmail || '', guestPhone || '', address || '', totalAmount || 0, items]
    );

    const newOrder = await safeQueryOne(`SELECT * FROM orders WHERE id = ?`, [result.insertId]);
    if (newOrder?.items) newOrder.items = typeof newOrder.items === 'string' ? JSON.parse(newOrder.items) : newOrder.items;

    res.json({ success: true, message: 'Order placed successfully', data: newOrder });
  } catch (error) {
    Logger.error('Direct order error:', error);
    res.status(500).json({ success: false, message: 'Failed to place order: ' + error.message });
  }
};

module.exports = {
  placeOrder,
  getAllOrders,
  getOrderById,
  getOrderByNumber,
  getOrdersByUser,
  getGuestOrders,
  getOrderStats,
  updateOrderStatus,
  cancelOrder,
  directOrder,
};
// orderController.js - Complete with product enrichment and formatted dates

const { safeQuery, safeQueryOne } = require("../configurations/db");
const Logger = require("../utils/logger/logger");
const { sendEmail } = require("../../../global/index").utils;

const SITE_URL = process.env.SITE_URL || "https://siasahub.co.ke";

const generateOrderNumber = () => {
  return "SH-ORD-" + Math.random().toString(36).substr(2, 9).toUpperCase();
};

// Helper: enrich order items with product details from DB
const enrichOrderItems = async (order) => {
  if (!order || !order.items) return order;

  let items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
  if (!items.length) {
    order.items = [];
    return order;
  }

  // Extract unique product IDs
  const productIds = [...new Set(items.map(item => item.productId).filter(id => id))];
  if (productIds.length === 0) return order;

  // Fetch all products in one query
  const placeholders = productIds.map(() => '?').join(',');
  const products = await safeQuery(
    `SELECT id, name, price, image, slug FROM products WHERE id IN (${placeholders})`,
    productIds
  );
  const productMap = new Map(products.map(p => [p.id, p]));

  // Enrich each item
  order.items = items.map(item => ({
    ...item,
    product: productMap.get(item.productId) || null,
    // Also add legacy fields for compatibility
    name: productMap.get(item.productId)?.name || 'Unknown Product',
    image: productMap.get(item.productId)?.image || '',
    slug: productMap.get(item.productId)?.slug || '',
    unit_price: item.price || productMap.get(item.productId)?.price || 0,
    total_price: (item.price || 0) * (item.quantity || 1)
  }));

  return order;
};

// Helper: format MySQL datetime to readable string
const formatDate = (dateStr) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return date.toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' });
};

// Helper: apply enrichment and formatting to an order object
const enrichOrder = async (order) => {
  if (!order) return null;
  order = await enrichOrderItems(order);
  order.created_at_formatted = formatDate(order.created_at);
  order.updated_at_formatted = formatDate(order.updated_at);
  return order;
};

// Helper: apply to multiple orders
const enrichOrders = async (orders) => {
  const enriched = [];
  for (const order of orders) {
    enriched.push(await enrichOrder(order));
  }
  return enriched;
};

// Helper: send order confirmation email with leader suggestions
const sendOrderConfirmationEmail = async (order) => {
  try {
    if (!order.customer_email) return;

    // Fetch featured leaders for the email template
    const featuredLeaders = await safeQuery(
      `SELECT name, slug, position FROM leaders WHERE status = 'active' ORDER BY endorsement_count DESC LIMIT 3`
    );

    const leaderLinks = featuredLeaders.map(l =>
      `<li style="margin-bottom: 10px;">
        <a href="${SITE_URL}/leader/${l.slug}" style="color: #e11d48; text-decoration: none; font-weight: 600;">
          ${l.name}
        </a> - ${l.position || 'Aspirant'}
      </li>`
    ).join('');

    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; border: 1px solid #f0f0f0; border-radius: 16px; color: #1a1a2e;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #e11d48; margin-bottom: 8px;">Order Confirmed!</h1>
          <p style="font-size: 16px; color: #64748b;">Thank you for shopping with Siasa Hub.</p>
        </div>

        <div style="background: #f8fafc; padding: 24px; border-radius: 12px; margin-bottom: 30px;">
          <h3 style="margin-top: 0;">Order Summary</h3>
          <p style="margin: 4px 0;">Order Number: <strong>${order.order_number}</strong></p>
          <p style="margin: 4px 0;">Total Amount: <strong>KES ${Number(order.total_amount).toLocaleString()}</strong></p>
          <p style="margin: 4px 0;">Delivery Address: ${order.address}</p>
        </div>

        <div style="border-top: 2px solid #f1f5f9; padding-top: 30px;">
          <h3 style="color: #1e293b;">Be an Informed Citizen!</h3>
          <p style="line-height: 1.6; color: #475569;">While we prepare your order, take a moment to explore the manifestos of these featured leaders and shape our future:</p>
          
          <ul style="list-style: none; padding: 0;">
            ${leaderLinks}
          </ul>

          <div style="text-align: center; margin-top: 32px;">
            <a href="${SITE_URL}/leaders" style="background: #e11d48; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 700; display: inline-block;">
              Explore All Manifestos
            </a>
          </div>
        </div>

        <p style="margin-top: 40px; font-size: 13px; color: #94a3b8; text-align: center;">
          If you have any questions, please reply to this email.<br>
          © 2026 Siasa Hub Digital Campaign Agency.
        </p>
      </div>
    `;

    await sendEmail({
      to: order.customer_email,
      subject: `Hooray! Order ${order.order_number} Received`,
      text: `Hi ${order.customer_name}, thank you for your order! View your order at ${SITE_URL}/marketplace and explore manifestos at ${SITE_URL}/leaders`,
      html
    });

    Logger.info(`Confirmation email sent to ${order.customer_email} for order ${order.order_number}`);
  } catch (error) {
    Logger.error("Failed to send order confirmation email:", error);
  }
};

// ========== MAIN CONTROLLER FUNCTIONS ==========
const placeOrder = async (req, res) => {
  try {
    const { userId, guestName, guestEmail, guestPhone, address, totalAmount, items } = req.body;
    const orderNumber = generateOrderNumber();

    const result = await safeQuery(
      `INSERT INTO orders (order_number, user_id, customer_name, customer_email, customer_phone, address, total_amount, items, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending_payment', NOW(), NOW())`,
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



    //  Clear the user's cart after order is placed
    if (userId) {
      await safeQuery(`DELETE FROM cart WHERE user_id = ?`, [userId]);
    }

    const newOrder = await safeQueryOne(`SELECT * FROM orders WHERE id = ?`, [result.insertId]);
    const enrichedOrder = await enrichOrder(newOrder);

    // Send confirmation email (async)
    sendOrderConfirmationEmail(enrichedOrder).catch(err => Logger.error("Email trigger error:", err));

    res.json({ success: true, message: "Order placed successfully", data: enrichedOrder });
  } catch (error) {
    Logger.error("Error placing order:", error);
    res.status(500).json({ success: false, message: "Error placing order: " + error.message });
  }
};



const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await safeQueryOne(`SELECT * FROM orders WHERE id = ?`, [id]);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    const enriched = await enrichOrder(order);
    res.json({ success: true, data: enriched });
  } catch (error) {
    Logger.error("Error fetching order by ID:", error);
    res.status(500).json({ success: false, message: "Error fetching order" });
  }
};

const getOrderByNumber = async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const order = await safeQueryOne(`SELECT * FROM orders WHERE order_number = ?`, [orderNumber]);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    const enriched = await enrichOrder(order);
    res.json({ success: true, data: enriched });
  } catch (error) {
    Logger.error("Error fetching order by number:", error);
    res.status(500).json({ success: false, message: "Error fetching order" });
  }
};

const getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    const orders = await safeQuery(
      `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [userId, parseInt(limit), parseInt(offset)]
    );
    const enrichedOrders = await enrichOrders(orders);
    const countResult = await safeQueryOne(`SELECT COUNT(*) as total FROM orders WHERE user_id = ?`, [userId]);
    res.json({
      success: true,
      data: enrichedOrders,
      pagination: { total: countResult?.total || 0, limit: parseInt(limit), offset: parseInt(offset) }
    });
  } catch (error) {
    Logger.error("Error fetching user orders:", error);
    res.status(500).json({ success: false, message: "Error fetching orders" });
  }
};

const getGuestOrders = async (req, res) => {
  try {
    const { email, phone } = req.query;
    if (!email && !phone) return res.status(400).json({ success: false, message: "Email or phone is required" });
    let query = `SELECT * FROM orders WHERE customer_email = ?`;
    let params = [email];
    if (phone && !email) {
      query = `SELECT * FROM orders WHERE customer_phone = ?`;
      params = [phone];
    }
    const orders = await safeQuery(query, params);
    const enrichedOrders = await enrichOrders(orders);
    res.json({ success: true, data: enrichedOrders });
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
    const enrichedOrders = await enrichOrders(orders);
    const countResult = await safeQueryOne(`SELECT COUNT(*) as total FROM orders`);
    res.json({
      success: true,
      data: enrichedOrders,
      pagination: { total: countResult?.total || 0, limit: parseInt(limit), offset: parseInt(offset) }
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
    res.json({ success: true, data: stats });
  } catch (error) {
    Logger.error("Error fetching order stats:", error);
    res.status(500).json({ success: false, message: "Error fetching order stats" });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ["pending_payment", "paid", "pending", "processed", "shipped", "completed", "cancelled"];
    if (!validStatuses.includes(status)) return res.status(400).json({ success: false, message: "Invalid status" });
    const order = await safeQueryOne(`SELECT id FROM orders WHERE id = ?`, [id]);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    await safeQuery(`UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?`, [status, id]);
    const updatedOrder = await safeQueryOne(`SELECT * FROM orders WHERE id = ?`, [id]);
    const enriched = await enrichOrder(updatedOrder);
    res.json({ success: true, message: "Order status updated", data: enriched });
  } catch (error) {
    Logger.error("Error updating order status:", error);
    res.status(500).json({ success: false, message: "Error updating order status" });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const order = await safeQueryOne(`SELECT id, status, user_id FROM orders WHERE id = ? AND (user_id = ? OR user_id IS NULL)`, [id, userId]);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (order.status !== "pending") return res.status(400).json({ success: false, message: "Only pending orders can be cancelled" });
    await safeQuery(`UPDATE orders SET status = 'cancelled', updated_at = NOW() WHERE id = ?`, [id]);
    res.json({ success: true, message: "Order cancelled successfully" });
  } catch (error) {
    Logger.error("Error cancelling order:", error);
    res.status(500).json({ success: false, message: "Error cancelling order" });
  }
};

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
    const enriched = await enrichOrder(newOrder);

    // Send confirmation email (async)
    sendOrderConfirmationEmail(enriched).catch(err => Logger.error("Email trigger error:", err));

    res.json({ success: true, message: 'Order placed successfully', data: enriched });
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
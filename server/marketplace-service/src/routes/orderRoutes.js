const express = require("express");
const router = express.Router();

const {
  placeOrder,getAllOrders,getOrderById,getOrderByNumber,getOrdersByUser,getGuestOrders,getOrderStats,updateOrderStatus,cancelOrder } = require("../controller/order-controller");
// Place a new order
router.post("/", placeOrder);

// Get order by ID
router.get("/:id", getOrderById);
router.get("/track/:orderNumber", getOrderByNumber);
router.get("/user/:userId", getOrdersByUser);
router.post("/:id/cancel", cancelOrder);

// Get guest orders by email or phone
router.get("/guest/lookup", getGuestOrders);

// Get all orders (admin)
router.get("/admin/all", getAllOrders);
router.get("/admin/stats", getOrderStats);

// Update order status (admin)
router.patch("/admin/:id/status", updateOrderStatus);

router.get("/", getAllOrders);
router.get("/stats", getOrderStats);
router.patch("/:id/status", updateOrderStatus);

module.exports = router;
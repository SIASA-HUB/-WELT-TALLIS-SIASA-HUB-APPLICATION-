const express = require("express");
const router = express.Router();

const {
  placeOrder, getAllOrders, getOrderById, getOrderByNumber,
  getOrdersByUser, getGuestOrders, getOrderStats, updateOrderStatus, cancelOrder,
  directOrder
} = require("../controller/order-controller");

// ─── Place Order ─────────────────────────────────────────────────────────────
router.post("/", placeOrder);         // POST /orders
router.post("/place", placeOrder);    // POST /orders/place  ← frontend calls this

// ─── Stats (must be before /:id) ─────────────────────────────────────────────
router.get("/stats", getOrderStats);
router.get("/admin/all", getAllOrders);
router.get("/admin/stats", getOrderStats);

// ─── Guest & Tracking ─────────────────────────────────────────────────────────
router.get("/guest/lookup", getGuestOrders);
router.get("/track/:orderNumber", getOrderByNumber);

// ─── User Orders ──────────────────────────────────────────────────────────────
router.get("/user/:userId", getOrdersByUser);

// ─── Admin Status Update ─────────────────────────────────────────────────────
router.patch("/admin/:id/status", updateOrderStatus);
router.patch("/:id/status", updateOrderStatus);

// ─── All Orders (admin list fallback) ─────────────────────────────────────────
router.get("/", getAllOrders);

// ─── Single Order ─────────────────────────────────────────────────────────────
router.get("/:id", getOrderById);
router.post("/:id/cancel", cancelOrder);

module.exports = router;
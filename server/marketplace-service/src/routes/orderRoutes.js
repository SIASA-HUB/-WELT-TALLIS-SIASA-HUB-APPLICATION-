const express = require("express");
const router = express.Router();

const {
  placeOrder, getAllOrders, getOrderById, getOrderByNumber,
  getOrdersByUser, getGuestOrders, getOrderStats, updateOrderStatus, cancelOrder,
  directOrder
} = require("../controller/order-controller");

const { authenticate } = require("../../../global/index");

// ─── Place Order ─────────────────────────────────────────────────────────────
router.post("/", authenticate, placeOrder);
router.post("/place", authenticate, placeOrder);

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
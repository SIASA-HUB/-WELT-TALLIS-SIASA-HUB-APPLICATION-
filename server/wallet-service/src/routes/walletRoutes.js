// wallet-service/src/routes/walletRoutes.js — Fully secured
const express = require("express");
const router = express.Router();
const {
  getWalletBalance,
  getUserStats,
  getRechargePackages,
  initiateDeposit,
  directDeposit,
  handlePesapalIPN,
  initiateStkPush,
  handleMpesaCallback,
  checkPaymentStatus,
  useWalletForEndorsement,
  getTransactionHistory,
  addPoints,
  deductPoints,
  getBalance,
  calculateBonus,
} = require("../controllers/walletController");

// Import global auth middleware and global DB
const {
  authenticate,
  authorize,
  walletLimiter,
  authLimiter,
  safeQuery,
  safeQueryOne,
} = require("../../../global/index");

const db = require("../../../global/index").db;

// Helper: enforce user owns resource OR is admin
const ownOrAdmin = (req, res, next) => {
  const { user_id } = req.params;
  const jwtId = req.user?.userId;
  const isAdmin = req.user?.role === "admin";
  if (!isAdmin && jwtId !== user_id) {
    return res.status(403).json({ success: false, message: "Access forbidden" });
  }
  next();
};

// ============================================================
// PUBLIC ROUTES (no auth — health, packages, callbacks)
// ============================================================
router.get("/health", (req, res) => res.json({ success: true, status: "ok", service: "wallet-service" }));
router.get("/packages", getRechargePackages);
router.get("/recharge-packages", getRechargePackages);

// Pesapal & M-Pesa callbacks MUST be public (external payment providers call them)
router.post("/pesapal-ipn", handlePesapalIPN);
router.post("/mpesa/callback", handleMpesaCallback);

// ============================================================
// AUTHENTICATED USER ROUTES
// ============================================================

/** GET wallet balance — user can only see their own */
router.get("/balance/:user_id", authenticate, ownOrAdmin, walletLimiter, getWalletBalance);

/** GET wallet stats */
router.get("/users/:user_id/stats", authenticate, ownOrAdmin, getUserStats);

/** GET transaction history — user can only see their own */
router.get("/transactions/:user_id", authenticate, ownOrAdmin, getTransactionHistory);

/** GET summary */
router.get("/summary/:user_id", authenticate, ownOrAdmin, async (req, res) => {
  const { user_id } = req.params;
  try {
    const summary = await db.safeQueryOne(
      `SELECT 
        SUM(CASE WHEN type = 'deposit' AND status = 'completed' THEN amount ELSE 0 END) as total_deposits,
        SUM(CASE WHEN type IN ('endorsement','withdrawal') AND status = 'completed' THEN amount ELSE 0 END) as total_spent,
        SUM(CASE WHEN type = 'bonus' AND status = 'completed' THEN amount ELSE 0 END) as total_bonus,
        COUNT(CASE WHEN type = 'deposit' AND status = 'completed' THEN 1 END) as deposit_count
       FROM wallet_transactions WHERE user_id = ?`,
      [user_id]
    );
    res.json({ success: true, data: summary });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

/** GET payment status — authenticated required */
router.get("/status/:transactionId", authenticate, checkPaymentStatus);

/** Initiate Pesapal deposit */
router.post("/deposit", authenticate, walletLimiter, initiateDeposit);

/** M-Pesa STK Push — require auth so we get JWT user_id */
router.post("/mpesa/stkpush", authenticate, walletLimiter, initiateStkPush);

/** Use wallet for endorsement — JWT user_id is used in controller */
router.post("/use", authenticate, walletLimiter, useWalletForEndorsement);

// ============================================================
// ADMIN ROUTES — require auth + admin role
// ============================================================

router.get("/admin/transactions", authenticate, authorize("admin"), async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 100, 500);
  const offset = parseInt(req.query.offset) || 0;
  try {
    const transactions = await db.safeQuery(
      `SELECT * FROM wallet_transactions ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    const countResult = await db.safeQueryOne(`SELECT COUNT(*) as total FROM wallet_transactions`);
    res.json({ success: true, data: transactions, pagination: { limit, offset, total: countResult?.total || 0 } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.get("/admin/balance/:user_id", authenticate, authorize("admin"), async (req, res) => {
  const { user_id } = req.params;
  try {
    const balance = await getBalance(user_id);
    res.json({ success: true, balance });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.get("/admin/wallet/:user_id", authenticate, authorize("admin"), async (req, res) => {
  const { user_id } = req.params;
  try {
    const wallet = await db.safeQueryOne(`SELECT * FROM user_wallets WHERE user_id = ?`, [user_id]);
    if (!wallet) return res.status(404).json({ success: false, message: "Wallet not found" });
    res.json({ success: true, data: wallet });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.get("/admin/stats", authenticate, authorize("admin"), async (req, res) => {
  try {
    const [totalWallets, totalTx, totalBalance] = await Promise.all([
      db.safeQueryOne(`SELECT COUNT(*) as count FROM user_wallets`),
      db.safeQueryOne(`SELECT COUNT(*) as count FROM wallet_transactions`),
      db.safeQueryOne(`SELECT SUM(balance) as total FROM user_wallets`),
    ]);
    res.json({
      success: true,
      data: {
        total_wallets: totalWallets?.count || 0,
        total_transactions: totalTx?.count || 0,
        total_balance_in_circulation: totalBalance?.total || 0,
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.post("/admin/add-points", authenticate, authorize("admin"), async (req, res) => {
  const { user_id, amount = 1000, description = "Admin bonus" } = req.body;
  if (!user_id) return res.status(400).json({ success: false, message: "User ID required" });
  if (!amount || amount <= 0) return res.status(400).json({ success: false, message: "Valid amount required" });
  try {
    const result = await addPoints(user_id, amount, description);
    res.json({ success: true, message: `Added ${amount} points to user ${user_id}`, data: result.data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

router.post("/admin/deduct-points", authenticate, authorize("admin"), async (req, res) => {
  const { user_id, amount, description } = req.body;
  if (!user_id || !amount) return res.status(400).json({ success: false, message: "User ID and amount required" });
  try {
    const result = await deductPoints(user_id, amount, description || "Admin deduction");
    res.json({ success: true, message: `Deducted ${amount} points from user ${user_id}`, data: result.data });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

/** Direct deposit — ADMIN ONLY (for manual testing / customer support) */
router.post("/direct-deposit", authenticate, authorize("admin"), directDeposit);

module.exports = router;

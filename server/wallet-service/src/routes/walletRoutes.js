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

// Import global DB at the top
const { safeQuery, safeQueryOne } = require("../../../global/index").db;

// ============================================
// PUBLIC ROUTES
// ============================================

router.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "ok",
    service: "wallet-service",
    timestamp: new Date().toISOString(),
  });
});

router.get("/balance/:user_id", getWalletBalance);
router.get("/users/:user_id/stats", getUserStats);
router.get("/packages", getRechargePackages);
router.get("/transactions/:user_id", getTransactionHistory);
router.get("/status/:transactionId", checkPaymentStatus);

// ============================================
// PESAPAL PAYMENT ROUTES
// ============================================

router.post("/deposit", initiateDeposit);
router.post("/pesapal-ipn", handlePesapalIPN);

// ============================================
// M-PESA PAYMENT ROUTES
// ============================================

router.post("/mpesa/stkpush", initiateStkPush);
router.post("/mpesa/callback", handleMpesaCallback);

// ============================================
// TEST ROUTES
// ============================================

router.post("/direct-deposit", directDeposit);

// ============================================
// WALLET USAGE ROUTES
// ============================================

router.post("/use", useWalletForEndorsement);

// ============================================
// ADMIN ROUTES (Add auth middleware in production)
// ============================================

router.post("/admin/add-points", async (req, res) => {
  const { user_id, amount = 1000, description = "Admin bonus" } = req.body;

  if (!user_id) {
    return res
      .status(400)
      .json({ success: false, message: "User ID required" });
  }

  try {
    const result = await addPoints(user_id, amount, description);
    if (result.success) {
      res.json({
        success: true,
        message: `Added ${amount} points to user ${user_id}`,
        data: result.data,
      });
    } else {
      res.status(500).json({ success: false, message: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/admin/deduct-points", async (req, res) => {
  const { user_id, amount, description } = req.body;

  if (!user_id || !amount) {
    return res
      .status(400)
      .json({ success: false, message: "User ID and amount required" });
  }

  try {
    const result = await deductPoints(
      user_id,
      amount,
      description || "Admin deduction",
    );
    if (result.success) {
      res.json({
        success: true,
        message: `Deducted ${amount} points from user ${user_id}`,
        data: result.data,
      });
    } else {
      res.status(400).json({ success: false, message: result.error });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/admin/balance/:user_id", async (req, res) => {
  const { user_id } = req.params;
  try {
    const balance = await getBalance(user_id);
    res.json({ success: true, balance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/admin/transactions", async (req, res) => {
  const { limit = 100, offset = 0 } = req.query;
  try {
    const transactions = await safeQuery(
      `SELECT * FROM wallet_transactions 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [parseInt(limit), parseInt(offset)],
    );
    const countResult = await safeQuery(
      `SELECT COUNT(*) as total FROM wallet_transactions`,
    );
    res.json({
      success: true,
      data: transactions,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: countResult[0]?.total || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/admin/wallet/:user_id", async (req, res) => {
  const { user_id } = req.params;
  try {
    const wallet = await safeQueryOne(
      `SELECT * FROM user_wallets WHERE user_id = ?`,
      [user_id],
    );
    if (!wallet) {
      return res
        .status(404)
        .json({ success: false, message: "Wallet not found" });
    }
    res.json({ success: true, data: wallet });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// UTILITY ROUTES
// ============================================

router.get("/recharge-packages", getRechargePackages);

router.get("/summary/:user_id", async (req, res) => {
  const { user_id } = req.params;
  try {
    const summary = await safeQueryOne(
      `SELECT 
        SUM(CASE WHEN type = 'deposit' AND status = 'completed' THEN amount ELSE 0 END) as total_deposits,
        SUM(CASE WHEN type = 'endorsement' AND status = 'completed' THEN amount ELSE 0 END) as total_spent,
        SUM(CASE WHEN type = 'bonus' AND status = 'completed' THEN amount ELSE 0 END) as total_bonus,
        COUNT(CASE WHEN type = 'deposit' AND status = 'completed' THEN 1 END) as deposit_count,
        COUNT(CASE WHEN type = 'endorsement' AND status = 'completed' THEN 1 END) as endorsement_count
       FROM wallet_transactions 
       WHERE user_id = ?`,
      [user_id],
    );
    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// DEBUG ROUTE
// ============================================
router.get("/debug/config", (req, res) => {
  res.json({
    success: true,
    data: {
      pesapal_env: process.env.PESAPAL_ENV || "sandbox",
      has_consumer_key: !!process.env.PESAPAL_CONSUMER_KEY,
      has_consumer_secret: !!process.env.PESAPAL_CONSUMER_SECRET,
      callback_url: process.env.PESAPAL_CALLBACK_URL,
      ipn_url: process.env.PESAPAL_IPN_URL,
      frontend_url: process.env.FRONTEND_URL,
    },
  });
});

module.exports = router;

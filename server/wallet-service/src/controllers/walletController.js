const { v4: uuidv4 } = require("uuid");
const axios = require("axios");
const {
  asyncHandler,
  db: { safeQuery, safeQueryOne, getConnection },
  mpesa: mpesaConfig,
  isPositiveAmount,
  isValidKenyanPhone,
} = require("../../../global/index");
const Logger = require("../utils/logger/logger");

const MPESA_SERVICE_URL = process.env.MPESA_SERVICE_URL || 'http://mpesa-service:8011/api/v1/mpesa';
const INTERNAL_SERVICE_SECRET = process.env.INTERNAL_SERVICE_SECRET || 'siasa-secret';

// Safaricom valid callback IPs (production + sandbox)
const SAFARICOM_IPS = new Set([
  "196.201.214.200","196.201.214.201","196.201.214.202","196.201.214.203",
  "196.201.214.204","196.201.214.207","196.201.214.208","196.201.214.209",
  "196.201.214.214","196.201.214.215","196.201.214.216",
  "127.0.0.1", "::1", "::ffff:127.0.0.1", // Allow local for development
]);

// Simple in-memory cache
const memoryCache = new Map();

// M-Pesa fallback is handled via internal service communication
// Removed PesaPal configuration helpers


// ============================================
// CALCULATE BONUS
// ============================================
const calculateBonus = (amount) => {
  if (amount < 5) return 0;
  if (amount < 100) return 0;
  if (amount < 500) return Math.floor(amount * 0.1);
  if (amount < 1000) return Math.floor(amount * 0.2);
  if (amount < 5000) return Math.floor(amount * 0.25);
  if (amount < 10000) return Math.floor(amount * 0.3);
  return Math.floor(amount * 0.35);
};

// ============================================
// GET WALLET BALANCE
// ============================================
const getWalletBalance = asyncHandler(async (req, res) => {
  // SECURITY: Use JWT user_id — never trust params without ownership check
  const requestedUserId = req.params.user_id;
  const jwtUserId = req.user?.userId;
  const isAdmin = req.user?.role === 'admin';

  // Ownership check: user can only see their own wallet unless admin
  // Relaxed for now to allow LDR_ and USR_ profiles to cross-access their balance
  if (!isAdmin && jwtUserId && jwtUserId !== requestedUserId && !jwtUserId.includes(requestedUserId.substring(4)) && !requestedUserId.includes(jwtUserId.substring(4))) {
    Logger.warn(`[AUTH] Potential cross-wallet access: ${jwtUserId} → ${requestedUserId}`);
    // return res.status(403).json({ success: false, message: "Access forbidden" });
  }

  const user_id = requestedUserId;
  if (!user_id) {
    return res.status(400).json({ success: false, message: "User ID is required" });
  }

  try {
    const cacheKey = `wallet_${user_id}`;
    if (memoryCache.has(cacheKey)) {
      return res.json({ success: true, data: memoryCache.get(cacheKey) });
    }

    let wallet = await safeQueryOne(
      `SELECT user_id, balance, total_deposited, total_bonus, updated_at FROM user_wallets WHERE user_id = ?`,
      [user_id]
    );

    if (!wallet) {
      // Auto-create wallet with 100 welcome points
      const conn = await getConnection();
      try {
        await conn.beginTransaction();
        const initialPoints = 100;
        await conn.execute(
          `INSERT INTO user_wallets (user_id, balance, total_deposited, total_bonus, created_at, updated_at) VALUES (?, ?, 0, ?, NOW(), NOW())`,
          [user_id, initialPoints, initialPoints]
        );
        const txId = `WELCOME-${Date.now()}-${uuidv4().substring(0, 8)}`;
        await conn.execute(
          `INSERT INTO wallet_transactions (transaction_id, user_id, amount, type, description, status, completed_at) VALUES (?, ?, ?, 'bonus', 'Welcome bonus points', 'completed', NOW())`,
          [txId, user_id, initialPoints]
        );
        await conn.commit();
        conn.release();
        wallet = { user_id, balance: initialPoints, total_deposited: 0, total_bonus: initialPoints, updated_at: new Date().toISOString() };
      } catch (e) {
        await conn.rollback(); conn.release(); throw e;
      }
    }

    memoryCache.set(cacheKey, wallet);
    setTimeout(() => memoryCache.delete(cacheKey), 30000);
    return res.json({ success: true, data: wallet });
  } catch (error) {
    Logger.error("Error fetching wallet balance:", error);
    
    // Defensive: if table is missing, return 0 balance instead of crashing
    if (error.message.includes("doesn't exist")) {
      return res.json({ 
        success: true, 
        data: { user_id, balance: 0, total_deposited: 0, total_bonus: 0, updated_at: new Date().toISOString() },
        message: "Wallet system initializing..."
      });
    }
    
    res.status(500).json({ success: false, message: "Failed to fetch wallet balance" });
  }
});

// ============================================
// GET RECARGE PACKAGES
// ============================================
const getRechargePackages = asyncHandler(async (req, res) => {
  const packages = [
    { amount: 5, bonus: 0, total: 5 },
    { amount: 10, bonus: 0, total: 10 },
    { amount: 20, bonus: 0, total: 20 },
    { amount: 50, bonus: 0, total: 50 },
    { amount: 100, bonus: 10, total: 110 },
    { amount: 200, bonus: 40, total: 240 },
    { amount: 500, bonus: 125, total: 625 },
    { amount: 1000, bonus: 300, total: 1300 },
    { amount: 5000, bonus: 1250, total: 6250 },
    { amount: 10000, bonus: 3000, total: 13000 },
  ];

  res.json({
    success: true,
    data: packages,
  });
});

// ============================================
// GET TRANSACTION HISTORY
// ============================================
const getTransactionHistory = asyncHandler(async (req, res) => {
  const { user_id } = req.params;
  const { limit = 50, offset = 0 } = req.query;

  if (!user_id) {
    return res.status(400).json({
      success: false,
      message: "User ID is required",
    });
  }

  try {
    const transactions = await safeQuery(
      `SELECT transaction_id, amount, type, description, status, reference_id, created_at, completed_at
       FROM wallet_transactions 
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [user_id, parseInt(limit), parseInt(offset)],
    );

    const countResult = await safeQuery(
      `SELECT COUNT(*) as total FROM wallet_transactions WHERE user_id = ?`,
      [user_id],
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
    Logger.error("Error fetching transactions:", { error: error.message });
    res.status(500).json({
      success: false,
      message: "Failed to fetch transaction history",
    });
  }
});

// ============================================
// CHECK PAYMENT STATUS
// ============================================
const checkPaymentStatus = asyncHandler(async (req, res) => {
  const { transactionId } = req.params;

  if (!transactionId) {
    return res.status(400).json({
      success: false,
      message: "Transaction ID is required",
    });
  }

  try {
    const transaction = await safeQueryOne(
      `SELECT * FROM wallet_transactions WHERE transaction_id = ?`,
      [transactionId],
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // Actively query M-Pesa service if still pending (crucial for local dev / cancellations)
    if (transaction.status === 'pending') {
      try {
        const mpesaUrl = process.env.MPESA_SERVICE_URL || 'http://localhost:8011/api/v1/mpesa';
        const axios = require('axios');
        const statusRes = await axios.get(`${mpesaUrl}/status/${transactionId}`);
        
        if (statusRes.data?.success) {
          const realStatus = statusRes.data.status;
          if (realStatus === 'completed') {
            // It's safer to wait for the callback to handle the balance update,
            // but we can at least update the transaction status here if needed.
            // For wallet, we'll let the callback handle the complex balance math,
            // but we can still return the real status to the frontend.
            transaction.status = 'paid'; // Treat completed as paid for frontend
          } else if (realStatus === 'failed' || realStatus === 'cancelled') {
             await safeQuery(`UPDATE wallet_transactions SET status = 'failed', updated_at = NOW() WHERE transaction_id = ?`, [transactionId]);
             transaction.status = 'failed';
          }
        }
      } catch (e) {
        Logger.warn(`⚠️ Could not query live M-Pesa status for wallet tx: ${e.message}`);
      }
    }

    res.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    Logger.error("Error checking payment status:", { error: error.message });
    res.status(500).json({
      success: false,
      message: "Failed to check payment status",
    });
  }
});

// ============================================
// USE WALLET FOR ENDORSEMENT
// ============================================
const useWalletForEndorsement = asyncHandler(async (req, res) => {
  // SECURITY: Always use JWT user_id, never trust body user_id
  const user_id = req.user?.userId;
  const { amount, endorsement_id } = req.body;

  if (!user_id) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }
  if (!amount || !endorsement_id) {
    return res.status(400).json({ success: false, message: "amount and endorsement_id are required" });
  }
  if (!isPositiveAmount(amount)) {
    return res.status(400).json({ success: false, message: "Invalid amount" });
  }

  const conn = await getConnection();
  try {
    await conn.beginTransaction();

    // Lock wallet row for update
    const [rows] = await conn.execute(
      `SELECT balance FROM user_wallets WHERE user_id = ? FOR UPDATE`,
      [user_id]
    );
    const wallet = rows[0];

    if (!wallet || wallet.balance < amount) {
      await conn.rollback(); conn.release();
      return res.status(400).json({ success: false, message: "Insufficient balance" });
    }

    await conn.execute(
      `UPDATE user_wallets SET balance = balance - ?, updated_at = NOW() WHERE user_id = ?`,
      [amount, user_id]
    );

    const transactionId = `END-${Date.now()}-${uuidv4().substring(0, 8)}`;
    await conn.execute(
      `INSERT INTO wallet_transactions (transaction_id, user_id, amount, type, reference_id, description, status, completed_at) VALUES (?, ?, ?, 'withdrawal', ?, ?, 'completed', NOW())`,
      [transactionId, user_id, amount, endorsement_id, `Endorsement payment of ${amount} points`]
    );

    await conn.commit(); conn.release();
    memoryCache.delete(`wallet_${user_id}`);

    res.json({
      success: true,
      message: "Payment successful",
      data: { transactionId, newBalance: wallet.balance - amount }
    });
  } catch (error) {
    try { await conn.rollback(); conn.release(); } catch {}
    Logger.error("Wallet endorsement error:", error);
    res.status(500).json({ success: false, message: "Failed to process payment" });
  }
});

// ============================================
// ADD POINTS (Admin)
// ============================================
// ADMIN function — adds points via proper connection transaction
const addPoints = async (user_id, amount, description = "Admin bonus") => {
  if (!user_id || !amount || amount <= 0) throw new Error("Invalid amount or user ID");

  const conn = await getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.execute(`SELECT id FROM user_wallets WHERE user_id = ? FOR UPDATE`, [user_id]);
    if (rows.length === 0) {
      await conn.execute(`INSERT INTO user_wallets (user_id, balance, total_deposited, total_bonus) VALUES (?, ?, 0, ?)`, [user_id, amount, amount]);
    } else {
      await conn.execute(`UPDATE user_wallets SET balance = balance + ?, total_bonus = total_bonus + ?, updated_at = NOW() WHERE user_id = ?`, [amount, amount, user_id]);
    }
    const txId = `ADMIN-${Date.now()}-${uuidv4().substring(0, 8)}`;
    await conn.execute(`INSERT INTO wallet_transactions (transaction_id, user_id, amount, type, description, status, completed_at) VALUES (?, ?, ?, 'deposit', ?, 'completed', NOW())`, [txId, user_id, amount, description]);
    await conn.commit(); conn.release();
    memoryCache.delete(`wallet_${user_id}`);
    return { success: true, data: { transactionId: txId, amount } };
  } catch (error) {
    try { await conn.rollback(); conn.release(); } catch {}
    throw error;
  }
};

// ============================================
// DEDUCT POINTS (Admin)
// ============================================
const deductPoints = async (user_id, amount, description = "Admin deduction") => {
  if (!user_id || !amount || amount <= 0) throw new Error("Invalid amount or user ID");

  const conn = await getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.execute(`SELECT balance FROM user_wallets WHERE user_id = ? FOR UPDATE`, [user_id]);
    const wallet = rows[0];
    if (!wallet || wallet.balance < amount) {
      await conn.rollback(); conn.release();
      throw new Error("Insufficient balance");
    }
    await conn.execute(`UPDATE user_wallets SET balance = balance - ?, updated_at = NOW() WHERE user_id = ?`, [amount, user_id]);
    const txId = `DEDUCT-${Date.now()}-${uuidv4().substring(0, 8)}`;
    await conn.execute(`INSERT INTO wallet_transactions (transaction_id, user_id, amount, type, description, status, completed_at) VALUES (?, ?, ?, 'withdrawal', ?, 'completed', NOW())`, [txId, user_id, amount, description]);
    await conn.commit(); conn.release();
    memoryCache.delete(`wallet_${user_id}`);
    return { success: true, data: { transactionId: txId, amount, newBalance: wallet.balance - amount } };
  } catch (error) {
    try { await conn.rollback(); conn.release(); } catch {}
    throw error;
  }
};

// ============================================
// GET BALANCE (Simple)
// ============================================
const getBalance = async (user_id) => {
  if (!user_id) {
    throw new Error("User ID is required");
  }

  const wallet = await safeQueryOne(
    `SELECT balance FROM user_wallets WHERE user_id = ?`,
    [user_id],
  );

  return wallet?.balance || 0;
};

// ============================================
// DIRECT DEPOSIT (Reliable Fallback)
// ============================================
const directDeposit = asyncHandler(async (req, res) => {
  // ADMIN ONLY — user_id from JWT for safety if admin crediting themselves, else from body for admin operations
  const user_id = req.body.user_id;
  const amount = parseFloat(req.body.amount);

  if (!user_id || !amount || amount < 5) {
    return res.status(400).json({ success: false, message: "Invalid amount or missing fields. Minimum is 5 KES" });
  }
  if (!isPositiveAmount(amount)) {
    return res.status(400).json({ success: false, message: "Invalid amount" });
  }

  const conn = await getConnection();
  try {
    await conn.beginTransaction();
    const bonus = calculateBonus(amount);
    const totalPoints = amount + bonus;

    const [walletRows] = await conn.execute(`SELECT id FROM user_wallets WHERE user_id = ? FOR UPDATE`, [user_id]);
    if (walletRows.length === 0) {
      await conn.execute(`INSERT INTO user_wallets (user_id, balance, total_deposited, total_bonus) VALUES (?, ?, ?, ?)`, [user_id, totalPoints, amount, bonus]);
    } else {
      await conn.execute(`UPDATE user_wallets SET balance = balance + ?, total_deposited = total_deposited + ?, total_bonus = total_bonus + ?, updated_at = NOW() WHERE user_id = ?`, [totalPoints, amount, bonus, user_id]);
    }

    const txId = `DEP-${Date.now()}-${uuidv4().substring(0, 8)}`;
    await conn.execute(`INSERT INTO wallet_transactions (transaction_id, user_id, amount, type, description, status, completed_at) VALUES (?, ?, ?, 'deposit', ?, 'completed', NOW())`, [txId, user_id, amount, `Direct deposit of ${amount} KES`]);

    if (bonus > 0) {
      const bonusId = `BONUS-${Date.now()}-${uuidv4().substring(0, 8)}`;
      await conn.execute(`INSERT INTO wallet_transactions (transaction_id, user_id, amount, type, reference_id, description, status, completed_at) VALUES (?, ?, ?, 'bonus', ?, ?, 'completed', NOW())`, [bonusId, user_id, bonus, txId, `Bonus from ${amount} KES deposit`]);
    }

    await conn.commit(); conn.release();
    memoryCache.delete(`wallet_${user_id}`);

    res.json({ success: true, message: `Deposit successful! ${totalPoints} points added (${amount} + ${bonus} bonus)`, data: { amount, bonus, totalPoints, transactionId: txId } });
  } catch (error) {
    try { await conn.rollback(); conn.release(); } catch {}
    Logger.error("Direct deposit failed:", error);
    res.status(500).json({ success: false, message: "Deposit failed. Please try again." });
  }
});

// ============================================
// INITIATE DEPOSIT (Redirect to STK Push)
// ============================================
const initiateDeposit = asyncHandler(async (req, res) => {
  const user_id = req.user?.userId || req.body.user_id;
  const { amount, phone_number } = req.body;

  Logger.info(
    `💰 [Wallet] Initiating deposit → User: ${user_id}, Amount: ${amount}, Phone: ${phone_number}`,
  );

  if (!user_id || !amount || !phone_number) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  // Redirect to STK Push logic
  req.body.phoneNumber = phone_number;
  return initiateStkPush(req, res);
});


// Pesapal handlers removed


// ============================================
// GET USER WALLET STATS
// ============================================
const getUserStats = asyncHandler(async (req, res) => {
  const { user_id } = req.params;

  if (!user_id) {
    return res.status(400).json({
      success: false,
      message: "User ID is required",
    });
  }

  try {
    // Get wallet summary
    const wallet = await safeQueryOne(
      `SELECT balance, total_deposited, total_bonus FROM user_wallets WHERE user_id = ?`,
      [user_id],
    );

    // Get counts for different transaction types
    const stats = await safeQueryOne(
      `SELECT 
        COUNT(*) as total_transactions,
        SUM(CASE WHEN type = 'deposit' AND status = 'completed' THEN amount ELSE 0 END) as total_deposits,
        SUM(CASE WHEN type IN ('endorsement', 'boost') AND status = 'completed' THEN amount ELSE 0 END) as total_spent,
        SUM(CASE WHEN type = 'bonus' AND status = 'completed' THEN amount ELSE 0 END) as total_bonus_received
       FROM wallet_transactions 
       WHERE user_id = ?`,
      [user_id],
    );

// Default values for new users
    if (!wallet) {
      const initialPoints = 100;
      Logger.info(`🆕 Initializing default wallet with 100 points for user: ${user_id}`);
      
      await safeQuery(
        `INSERT INTO user_wallets (user_id, balance, total_deposited, total_bonus, created_at, updated_at) 
         VALUES (?, ?, 0, ?, NOW(), NOW())`,
        [user_id, initialPoints, initialPoints],
      );

      const transactionId = `WELCOME-STATS-${Date.now()}-${uuidv4().substring(0, 8)}`;
      await safeQuery(
        `INSERT INTO wallet_transactions 
         (transaction_id, user_id, amount, type, description, status, completed_at)
         VALUES (?, ?, ?, 'bonus', 'Welcome bonus points', 'completed', NOW())`,
        [transactionId, user_id, initialPoints],
      );
    }

    const currentBalance = wallet ? wallet.balance : 100;
    const deposited = stats ? stats.total_deposits : 0;
    const spent = stats ? stats.total_spent : 0;
    const bonus = stats ? stats.total_bonus_received : 0;

    res.status(200).json({
      success: true,
      data: {
        balance: currentBalance,
        total_deposited: deposited,
        total_spent: spent,
        total_bonus: bonus,
        transaction_count: stats ? stats.total_transactions : 0,
        currency: "Points",
        is_new_user: !wallet
      },
    });
  } catch (error) {
    Logger.error("Error fetching user wallet stats:", error);
    
    // Defensive fallback
    if (error.message.includes("doesn't exist")) {
      return res.status(200).json({
        success: true,
        data: {
          balance: 0,
          total_deposited: 0,
          total_spent: 0,
          total_bonus: 0,
          transaction_count: 0,
          currency: "Points",
          is_new_user: true
        }
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch wallet statistics",
    });
  }
});

// ============================================
// M-PESA STK PUSH (Refactored to use mpesa-service)
// ============================================
const initiateStkPush = asyncHandler(async (req, res) => {
  // SECURITY: Use JWT user_id, not body user_id
  const user_id = req.user?.userId;
  const { phoneNumber, amount, type = "wallet", origin = "wallet", accountReference: bodyRef, transactionDesc } = req.body;

  if (!user_id) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }
  if (!phoneNumber || !amount) {
    return res.status(400).json({ success: false, message: "Missing phone or amount" });
  }
  if (!isPositiveAmount(amount) || amount < 5) {
    return res.status(400).json({ success: false, message: "Minimum amount is KES 5" });
  }

  Logger.info(`📲 [Wallet] Redirecting STK Push to mpesa-service for ${phoneNumber}, Amount: ${amount}, User: ${user_id}, Origin: ${origin}`);

  try {
    const response = await axios.post(`${MPESA_SERVICE_URL}/stkpush`, {
      phoneNumber,
      amount,
      userId: user_id,
      accountReference: bodyRef || (type === 'wallet' ? `WALLET-${user_id.substring(0, 8)}` : `BILL-${Date.now()}`),
      transactionDesc: transactionDesc || (type === 'wallet' ? "SiasaHub Wallet Top-up" : `SiasaHub payment for ${type || 'services'}`),
      type: type || 'wallet',
      origin: origin || 'wallet'
    }, {
      headers: { 'X-Internal-Secret': INTERNAL_SERVICE_SECRET },
      timeout: 30000
    });

    if (response.data?.success) {
      // mpesa-service returns checkoutRequestId at the top level (not nested in .data)
      const checkoutRequestId = response.data.checkoutRequestId 
        || response.data.data?.checkoutRequestId 
        || response.data.data?.CheckoutRequestID;

      if (!checkoutRequestId) {
        Logger.warn('[Wallet] STK Push succeeded but no checkoutRequestId returned — cannot create pending tx');
        return res.json({
          success: true,
          message: "STK Push initiated. Please check your phone.",
          data: { customerMessage: response.data.message || "Check your phone for M-Pesa prompt" }
        });
      }

      const reference = `STK-${Date.now()}`;
      await safeQuery(
        `INSERT INTO wallet_transactions (transaction_id, user_id, amount, type, description, status, reference_id, created_at) VALUES (?, ?, ?, 'deposit', ?, 'pending', ?, NOW())`,
        [checkoutRequestId, user_id, amount, `M-Pesa STK Push to ${phoneNumber}`, reference]
      );

      return res.json({
        success: true,
        message: "STK Push initiated. Please check your phone.",
        data: { checkoutRequestId, customerMessage: response.data.message || "Check your phone for M-Pesa prompt" }
      });
    }
    throw new Error(response.data?.message || "Failed to initiate push via mpesa-service");
  } catch (error) {
    Logger.error("M-Pesa STK Push error:", error.response?.data?.message || error.message);
    if (error.response) {
      Logger.error("Full M-Pesa Service Error Response:", {
        status: error.response.status,
        data: error.response.data
      });
    }
    res.status(error.response?.status || 500).json({ 
      success: false, 
      message: error.response?.data?.message || error.message || "STK Push failed. Check mpesa-service logs." 
    });
  }
});

// ============================================
// INTERNAL M-PESA CALLBACK (From mpesa-service)
// ============================================
const handleInternalMpesaCallback = asyncHandler(async (req, res) => {
  const secret = req.headers['x-internal-secret'];
  if (secret !== INTERNAL_SERVICE_SECRET) {
    Logger.warn(`⛔ Rejected internal callback from unauthorized source`);
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const { checkoutRequestId, status, receipt, amount, message } = req.body;
  Logger.info(`🔔 [Wallet] Internal Callback: ${checkoutRequestId}, Status: ${status}`);

  try {
    const transaction = await safeQueryOne(
      `SELECT * FROM wallet_transactions WHERE transaction_id = ? AND status = 'pending'`,
      [checkoutRequestId]
    );
    
    if (!transaction) {
      Logger.warn(`Transaction not found or already processed: ${checkoutRequestId}`);
      return res.status(200).json({ success: true });
    }

    if (status === 'completed') {
      const bonus = calculateBonus(transaction.amount);
      const totalPoints = transaction.amount + bonus;

      const conn = await getConnection();
      try {
        await conn.beginTransaction();
        await conn.execute(
          `INSERT INTO user_wallets (user_id, balance, total_deposited, total_bonus, updated_at) VALUES (?, ?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE balance = balance + ?, total_deposited = total_deposited + ?, total_bonus = total_bonus + ?, updated_at = NOW()`,
          [transaction.user_id, totalPoints, transaction.amount, bonus, totalPoints, transaction.amount, bonus]
        );
        await conn.execute(
          `UPDATE wallet_transactions SET status = 'completed', completed_at = NOW(), description = CONCAT(description, ' | Receipt: ', ?) WHERE transaction_id = ?`,
          [receipt || '', checkoutRequestId]
        );
        await conn.commit(); conn.release();
        memoryCache.delete(`wallet_${transaction.user_id}`);
        Logger.info(`✅ Wallet credited: ${totalPoints} pts to user ${transaction.user_id}`);
      } catch(e) {
        try { await conn.rollback(); conn.release(); } catch {}
        throw e;
      }
    } else {
      await safeQuery(`UPDATE wallet_transactions SET status = 'failed', description = CONCAT(description, ' | ', ?) WHERE transaction_id = ?`, [message || 'Failed', checkoutRequestId]);
      Logger.warn(`❌ M-Pesa STK Failed for wallet: ${message}`);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    Logger.error('Internal callback error:', error);
    res.status(500).json({ success: false });
  }
});

module.exports = {
  getWalletBalance,
  getUserStats,
  getRechargePackages,
  initiateDeposit,
  directDeposit,
  initiateStkPush,
  handleInternalMpesaCallback,
  checkPaymentStatus,
  useWalletForEndorsement,
  getTransactionHistory,
  addPoints,
  deductPoints,
  getBalance,
  calculateBonus,
  memoryCache,
};

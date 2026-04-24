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

// Safaricom valid callback IPs (production + sandbox)
const SAFARICOM_IPS = new Set([
  "196.201.214.200","196.201.214.201","196.201.214.202","196.201.214.203",
  "196.201.214.204","196.201.214.207","196.201.214.208","196.201.214.209",
  "196.201.214.214","196.201.214.215","196.201.214.216",
  "127.0.0.1", "::1", "::ffff:127.0.0.1", // Allow local for development
]);

// Simple in-memory cache
const memoryCache = new Map();

// Pesapal Configuration
const PESAPAL_URL =
  process.env.PESAPAL_ENV === "production"
    ? "https://pay.pesapal.com/v3"
    : "https://cybqa.pesapal.com/v3";

const PESAPAL_CONSUMER_KEY = process.env.PESAPAL_CONSUMER_KEY;
const PESAPAL_CONSUMER_SECRET = process.env.PESAPAL_CONSUMER_SECRET;

const CALLBACK_URL =
  process.env.PESAPAL_CALLBACK_URL ||
  "http://localhost:8008/api/v1/wallet/pesapal-callback";

const IPN_URL =
  process.env.PESAPAL_IPN_URL ||
  "http://localhost:8008/api/v1/wallet/pesapal-ipn";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5174";

// Check if Pesapal is configured
const isPesapalConfigured = () => {
  return (
    PESAPAL_CONSUMER_KEY &&
    PESAPAL_CONSUMER_SECRET &&
    PESAPAL_CONSUMER_KEY !== "your_consumer_key_here" &&
    PESAPAL_CONSUMER_SECRET !== "your_consumer_secret_here"
  );
};

// ============================================
// HELPER: GET PESAPAL AUTH TOKEN
// ============================================
const getPesapalAuthToken = async () => {
  if (!isPesapalConfigured()) {
    throw new Error("Pesapal credentials not configured");
  }

  try {
    Logger.info("🔑 Requesting Pesapal auth token...");

    const response = await axios.post(
      `${PESAPAL_URL}/api/v1/Auth/RequestToken`,
      {
        consumer_key: PESAPAL_CONSUMER_KEY,
        consumer_secret: PESAPAL_CONSUMER_SECRET,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 15000,
      },
    );

    if (response.data?.token) {
      Logger.info("✅ Pesapal authentication successful");
      return response.data.token;
    }

    throw new Error(
      `No token received. Response: ${JSON.stringify(response.data)}`,
    );
  } catch (error) {
    const errorMsg = error.response?.data || error.message;
    Logger.error("❌ Pesapal Auth Error:", errorMsg);
    throw new Error(`Pesapal authentication failed: ${errorMsg}`);
  }
};

// ============================================
// HELPER: REGISTER IPN
// ============================================
const registerIPN = async (authToken) => {
  try {
    Logger.info("📡 Registering IPN URL...");

    const response = await axios.post(
      `${PESAPAL_URL}/api/v1/URLSetup/RegisterIPN`,
      {
        url: IPN_URL,
        ipn_notification_type: "POST",
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    Logger.info(`✅ IPN registered successfully: ${response.data?.ipn_id}`);
    return response.data?.ipn_id;
  } catch (error) {
    Logger.error(
      "❌ IPN Registration Error:",
      error.response?.data || error.message,
    );
    return null;
  }
};

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
  if (!isAdmin && jwtUserId && jwtUserId !== requestedUserId) {
    return res.status(403).json({ success: false, message: "Access forbidden: you can only view your own wallet" });
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
// INITIATE PESAPAL DEPOSIT
// ============================================
const initiateDeposit = asyncHandler(async (req, res) => {
  const { user_id, amount, phone_number, email, first_name } = req.body;

  Logger.info(
    `💰 [Pesapal] Initiating deposit → User: ${user_id}, Amount: ${amount}, Phone: ${phone_number}`,
  );

  if (!user_id || !amount || !phone_number) {
    return res
      .status(400)
      .json({ success: false, message: "Missing required fields" });
  }

  if (amount < 5) {
    return res
      .status(400)
      .json({ success: false, message: "Minimum deposit is 5 KES" });
  }

  if (!isPesapalConfigured()) {
    Logger.warn("Pesapal not configured → falling back to direct deposit");
    return directDeposit(req, res);
  }

  try {
    const authToken = await getPesapalAuthToken();

    let ipnIdResult = await safeQueryOne(
      `SELECT value FROM system_settings WHERE key = 'pesapal_ipn_id'`,
    );

    let ipnId = ipnIdResult?.value;

    if (!ipnId) {
      ipnId = await registerIPN(authToken);
      if (ipnId) {
        await safeQuery(
          `INSERT INTO system_settings (key, value) VALUES ('pesapal_ipn_id', ?) ON DUPLICATE KEY UPDATE value = ?`,
          [ipnId, ipnId],
        );
      }
    }

    let formattedPhone = phone_number.replace(/\D/g, "");
    if (formattedPhone.startsWith("0"))
      formattedPhone = "254" + formattedPhone.slice(1);
    if (!formattedPhone.startsWith("254"))
      formattedPhone = "254" + formattedPhone;

    const referenceId = `DEP-${Date.now()}-${uuidv4().slice(0, 8)}`;

    const orderData = {
      id: referenceId,
      currency: "KES",
      amount: parseFloat(amount),
      description: `Wallet deposit for user ${user_id}`,
      callback_url: CALLBACK_URL,
      notification_id: ipnId,
      billing_address: {
        email_address: email || `${user_id}@example.com`,
        phone_number: formattedPhone,
        first_name: first_name || "SiasaHub User",
        last_name: "",
        country_code: "KE",
      },
    };

    Logger.info(`📤 Sending order to Pesapal: ${JSON.stringify(orderData)}`);

    const orderResponse = await axios.post(
      `${PESAPAL_URL}/api/v1/Transactions/SubmitOrderRequest`,
      orderData,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      },
    );

    Logger.info(
      `✅ Pesapal order response: ${JSON.stringify(orderResponse.data)}`,
    );

    if (orderResponse.data?.order_tracking_id) {
      await safeQuery(
        `INSERT INTO wallet_transactions 
         (transaction_id, user_id, amount, type, description, status, reference_id, created_at)
         VALUES (?, ?, ?, 'deposit', ?, 'pending', ?, NOW())`,
        [
          orderResponse.data.order_tracking_id,
          user_id,
          amount,
          `Pesapal deposit to ${formattedPhone}`,
          referenceId,
        ],
      );

      res.json({
        success: true,
        message: "Redirecting to Pesapal...",
        data: {
          redirect_url: orderResponse.data.redirect_url,
          order_tracking_id: orderResponse.data.order_tracking_id,
        },
      });
    } else {
      throw new Error("No order_tracking_id returned from Pesapal");
    }
  } catch (error) {
    Logger.error(
      "❌ Pesapal deposit failed:",
      error.response?.data || error.message,
    );
    Logger.info("Falling back to direct deposit...");
    return directDeposit(req, res);
  }
});

// ============================================
// PESAPAL CALLBACK
// ============================================
const handlePesapalCallback = asyncHandler(async (req, res) => {
  const { OrderTrackingId } = req.query;

  Logger.info(`📞 Pesapal callback received: ${OrderTrackingId}`);

  if (!OrderTrackingId) {
    return res.redirect(`${FRONTEND_URL}/wallet?status=failed`);
  }

  try {
    const transaction = await safeQueryOne(
      `SELECT * FROM wallet_transactions WHERE transaction_id = ?`,
      [OrderTrackingId],
    );

    if (transaction && transaction.status === "pending") {
      const authToken = await getPesapalAuthToken();
      const statusResponse = await axios.get(
        `${PESAPAL_URL}/api/v1/Transactions/GetTransactionStatus?orderTrackingId=${OrderTrackingId}`,
        { headers: { Authorization: `Bearer ${authToken}` } },
      );

      if (statusResponse.data.payment_status_description === "Completed") {
        const bonus = calculateBonus(transaction.amount);
        const totalPoints = transaction.amount + bonus;

        await safeQuery(
          `UPDATE user_wallets 
           SET balance = balance + ?, total_deposited = total_deposited + ?, total_bonus = total_bonus + ?
           WHERE user_id = ?`,
          [totalPoints, transaction.amount, bonus, transaction.user_id],
        );

        await safeQuery(
          `UPDATE wallet_transactions 
           SET status = 'completed', completed_at = NOW() 
           WHERE transaction_id = ?`,
          [OrderTrackingId],
        );

        memoryCache.delete(`wallet_${transaction.user_id}`);
      }
    }

    res.redirect(`${FRONTEND_URL}/wallet?status=success`);
  } catch (error) {
    Logger.error("Callback error:", { error: error.message });
    res.redirect(`${FRONTEND_URL}/wallet?status=failed`);
  }
});

// ============================================
// PESAPAL IPN
// ============================================
const handlePesapalIPN = asyncHandler(async (req, res) => {
  const { OrderTrackingId } = req.body;

  Logger.info(`🔔 Pesapal IPN received: ${OrderTrackingId}`);

  try {
    const transaction = await safeQueryOne(
      `SELECT * FROM wallet_transactions WHERE transaction_id = ?`,
      [OrderTrackingId],
    );

    if (transaction && transaction.status === "pending") {
      const authToken = await getPesapalAuthToken();
      const statusResponse = await axios.get(
        `${PESAPAL_URL}/api/v1/Transactions/GetTransactionStatus?orderTrackingId=${OrderTrackingId}`,
        { headers: { Authorization: `Bearer ${authToken}` } },
      );

      if (statusResponse.data.payment_status_description === "Completed") {
        const bonus = calculateBonus(transaction.amount);
        const totalPoints = transaction.amount + bonus;

        await safeQuery(
          `UPDATE user_wallets 
           SET balance = balance + ?, total_deposited = total_deposited + ?, total_bonus = total_bonus + ?
           WHERE user_id = ?`,
          [totalPoints, transaction.amount, bonus, transaction.user_id],
        );

        await safeQuery(
          `UPDATE wallet_transactions 
           SET status = 'completed', completed_at = NOW() 
           WHERE transaction_id = ?`,
          [OrderTrackingId],
        );

        memoryCache.delete(`wallet_${transaction.user_id}`);
      }
    }

    res.status(200).json({ status: "OK" });
  } catch (error) {
    Logger.error("IPN error:", { error: error.message });
    res.status(200).json({ status: "OK" });
  }
});

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
// M-PESA STK PUSH
// ============================================
const initiateStkPush = asyncHandler(async (req, res) => {
  // SECURITY: Use JWT user_id, not body user_id
  const user_id = req.user?.userId;
  const { phoneNumber, amount } = req.body;

  if (!user_id) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }
  if (!phoneNumber || !amount) {
    return res.status(400).json({ success: false, message: "Missing phone or amount" });
  }
  if (!isPositiveAmount(amount) || amount < 5) {
    return res.status(400).json({ success: false, message: "Minimum amount is KES 5" });
  }

  Logger.info(`📲 [M-Pesa] STK Push for ${phoneNumber}, Amount: ${amount}, User: ${user_id}`);

  try {
    const reference = `STK-${Date.now()}`;
    const callbackUrl = process.env.MPESA_CALLBACK_URL || `${process.env.BASE_URL || 'http://localhost:8008'}/api/v1/wallet/mpesa/callback`;

    const result = await mpesaConfig.stkPush(phoneNumber, amount, reference, "Wallet Top-up", callbackUrl);

    if (result.ResponseCode === "0") {
      await safeQuery(
        `INSERT INTO wallet_transactions (transaction_id, user_id, amount, type, description, status, reference_id, created_at) VALUES (?, ?, ?, 'deposit', ?, 'pending', ?, NOW())`,
        [result.CheckoutRequestID, user_id, amount, `M-Pesa STK Push to ${phoneNumber}`, reference]
      );
      return res.json({
        success: true,
        message: "STK Push initiated. Please check your phone.",
        data: { checkoutRequestId: result.CheckoutRequestID, customerMessage: result.CustomerMessage }
      });
    }
    throw new Error(result.CustomerMessage || "Failed to initiate push");
  } catch (error) {
    Logger.error("M-Pesa STK Push error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// M-PESA CALLBACK
// ============================================
const handleMpesaCallback = asyncHandler(async (req, res) => {
  // SECURITY: Validate that request comes from Safaricom's IPs
  const clientIp = req.ip || req.connection?.remoteAddress || '';
  const cleanIp = clientIp.replace('::ffff:', '');
  if (process.env.NODE_ENV === 'production' && !SAFARICOM_IPS.has(cleanIp)) {
    Logger.warn(`⛔ Rejected M-Pesa callback from unauthorized IP: ${cleanIp}`);
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const { Body } = req.body;
  if (!Body?.stkCallback) {
    return res.status(400).json({ success: false, message: 'Invalid callback data' });
  }

  const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = Body.stkCallback;
  Logger.info(`🔔 [M-Pesa] Callback: ${CheckoutRequestID}, Result: ${ResultCode}`);

  try {
    const transaction = await safeQueryOne(
      `SELECT * FROM wallet_transactions WHERE transaction_id = ? AND status = 'pending'`,
      [CheckoutRequestID]
    );
    if (!transaction) {
      Logger.warn(`Transaction not found or already processed: ${CheckoutRequestID}`);
      return res.status(200).json({ success: true }); // Always ack Safaricom
    }

    if (ResultCode === 0 && CallbackMetadata) {
      // Extract M-Pesa receipt from metadata
      const items = CallbackMetadata?.Item || [];
      const receiptItem = items.find(i => i.Name === 'MpesaReceiptNumber');
      const mpesaReceipt = receiptItem?.Value || '';

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
          [mpesaReceipt, CheckoutRequestID]
        );
        await conn.commit(); conn.release();
        memoryCache.delete(`wallet_${transaction.user_id}`);
        Logger.info(`✅ Wallet credited: ${totalPoints} pts to user ${transaction.user_id}`);
      } catch(e) {
        try { await conn.rollback(); conn.release(); } catch {}
        throw e;
      }
    } else {
      await safeQuery(`UPDATE wallet_transactions SET status = 'failed', description = CONCAT(description, ' | ', ?) WHERE transaction_id = ?`, [ResultDesc, CheckoutRequestID]);
      Logger.warn(`❌ M-Pesa STK Failed: ${ResultDesc}`);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    Logger.error('M-Pesa callback error:', error);
    res.status(500).json({ success: false });
  }
});

module.exports = {
  getWalletBalance,
  getUserStats,
  getRechargePackages,
  initiateDeposit,
  directDeposit,
  handlePesapalCallback,
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
  memoryCache,
};

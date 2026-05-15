const express = require("express");
const router = express.Router();
const { initiateMpesaPayment, handleInternalCallback, getPaymentStatus } = require("../controller/payment-controller");
const { authenticate } = require("../../../global/index");

// Initiate M-Pesa Payment
router.post("/mpesa/stkpush", authenticate, initiateMpesaPayment);

// Get Payment Status (Polling)
router.get("/status/:checkoutId", getPaymentStatus);

// Internal Callback from mpesa-service
router.post("/callback", handleInternalCallback);

module.exports = router;

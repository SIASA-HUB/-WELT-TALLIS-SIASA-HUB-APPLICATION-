// shared/mpesa/index.js
const axios = require("axios");
const crypto = require("crypto");
const Logger = require("../logger/logger");

class MpesaConfig {
  constructor() {
    this.consumerKey = process.env.MPESA_CONSUMER_KEY;
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    this.passkey = process.env.MPESA_PASSKEY;
    this.shortCode = process.env.MPESA_SHORTCODE;
    this.environment = process.env.NODE_ENV || "development";
    this.accessToken = null;
    this.tokenExpiry = null;

    this.baseURL =
      this.environment === "production"
        ? "https://api.safaricom.co.ke"
        : "https://sandbox.safaricom.co.ke";
  }

  // Get access token with caching
  async getAccessToken() {
    // Check if token is still valid (5 minutes buffer)
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const auth = Buffer.from(
        `${this.consumerKey}:${this.consumerSecret}`,
      ).toString("base64");

      const response = await axios.get(
        `${this.baseURL}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
        },
      );

      this.accessToken = response.data.access_token;
      // Token expires in 1 hour, set expiry to 55 minutes
      this.tokenExpiry = Date.now() + 55 * 60 * 1000;

      Logger.info("✅ M-Pesa access token obtained");
      return this.accessToken;
    } catch (error) {
      Logger.error("M-Pesa Auth Error:", error.response?.data || error.message);
      throw new Error("Failed to get M-Pesa access token");
    }
  }

  // Format phone number to international format
  formatPhoneNumber(phoneNumber) {
    let formatted = phoneNumber.toString().trim();

    // Remove any non-digit characters
    formatted = formatted.replace(/\D/g, "");

    // If starts with 0, replace with 254
    if (formatted.startsWith("0")) {
      formatted = "254" + formatted.substring(1);
    }
    // If starts with +, remove it
    else if (formatted.startsWith("254")) {
      formatted = formatted;
    }

    return formatted;
  }

  // Generate timestamp in required format
  generateTimestamp() {
    return new Date()
      .toISOString()
      .replace(/[^0-9]/g, "")
      .slice(0, -3);
  }

  // Generate password
  generatePassword(timestamp) {
    return Buffer.from(`${this.shortCode}${this.passkey}${timestamp}`).toString(
      "base64",
    );
  }

  // Initiate STK Push
  async stkPush(
    phoneNumber,
    amount,
    accountReference,
    transactionDesc,
    callbackUrl,
  ) {
    try {
      const token = await this.getAccessToken();
      const timestamp = this.generateTimestamp();
      const password = this.generatePassword(timestamp);
      const formattedPhone = this.formatPhoneNumber(phoneNumber);

      const isTillNumber = process.env.MPESA_TYPE === "till";
      const payload = {
        BusinessShortCode: isTillNumber ? process.env.MPESA_STORE_NUMBER : this.shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: isTillNumber ? "CustomerBuyGoodsOnline" : "CustomerPayBillOnline",
        Amount: Math.round(amount),
        PartyA: formattedPhone,
        PartyB: isTillNumber ? process.env.MPESA_STORE_NUMBER : this.shortCode,
        PhoneNumber: formattedPhone,
        CallBackURL: callbackUrl,
        AccountReference: accountReference.substring(0, 12),
        TransactionDesc: transactionDesc.substring(0, 13),
      };

      const response = await axios.post(
        `${this.baseURL}/mpesa/stkpush/v1/processrequest`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      Logger.info(`STK Push initiated: ${accountReference} - ${amount} KES`);
      return response.data;
    } catch (error) {
      Logger.error(
        "M-Pesa STK Push Error:",
        error.response?.data || error.message,
      );
      throw new Error(
        error.response?.data?.errorMessage ||
          "Failed to initiate M-Pesa payment",
      );
    }
  }

  // Query STK Push Status
  async queryStatus(checkoutRequestId) {
    try {
      const token = await this.getAccessToken();
      const timestamp = this.generateTimestamp();
      const password = this.generatePassword(timestamp);

      const payload = {
        BusinessShortCode: this.shortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
      };

      const response = await axios.post(
        `${this.baseURL}/mpesa/stkpushquery/v1/query`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      return response.data;
    } catch (error) {
      Logger.error(
        "M-Pesa Query Error:",
        error.response?.data || error.message,
      );
      throw new Error("Failed to query M-Pesa payment status");
    }
  }

  // Simulate callback response (for testing)
  simulateCallback(checkoutRequestId, resultCode = 0, resultDesc = "Success") {
    return {
      Body: {
        stkCallback: {
          MerchantRequestID: `MER-${Date.now()}`,
          CheckoutRequestID: checkoutRequestId,
          ResultCode: resultCode,
          ResultDesc: resultDesc,
          CallbackMetadata:
            resultCode === 0
              ? {
                  Item: [
                    { Name: "Amount", Value: 100 },
                    { Name: "MpesaReceiptNumber", Value: `R${Date.now()}` },
                    { Name: "TransactionDate", Value: Date.now() },
                    { Name: "PhoneNumber", Value: "254700000000" },
                  ],
                }
              : null,
        },
      },
    };
  }
}

// Export singleton instance
module.exports = new MpesaConfig();

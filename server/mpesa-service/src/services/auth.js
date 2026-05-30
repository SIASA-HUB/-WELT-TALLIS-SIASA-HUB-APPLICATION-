import axios from 'axios';
import { mpesaConfig } from '../config/mpesa.js';
import Logger from '../utils/logger.js';

let cachedToken = null;
let tokenExpiry  = 0;

export const getAccessToken = async (retries = 3) => {
  const { consumerKey, consumerSecret, baseUrl } = mpesaConfig;
  const now = Date.now();

  if (cachedToken && now < tokenExpiry - 120_000) return cachedToken;

  if (!consumerKey || !consumerSecret) throw new Error('M-Pesa credentials missing');

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  for (let i = 0; i < retries; i++) {
    try {
      const { data } = await axios.get(
        `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
        { headers: { Authorization: `Basic ${auth}` }, timeout: 15_000 }
      );

      if (!data?.access_token) throw new Error('Invalid response from Safaricom');

      cachedToken  = data.access_token;
      tokenExpiry  = now + (parseInt(data.expires_in) || 3599) * 1000;
      Logger.info(`[Auth] Token acquired`);
      return cachedToken;

    } catch (err) {
      Logger.warn(`[Auth] Attempt ${i + 1} failed: ${err.response?.data?.errorMessage || err.message}`);
      if (i === retries - 1) throw new Error(`M-Pesa Auth Failed: ${err.message}`);
      await new Promise(r => setTimeout(r, 2 ** i * 1000));
    }
  }
};
import axios from 'axios';
import { mpesaConfig } from '../config/mpesa.js';
import Logger from '../utils/logger.js';

let cachedToken = null;
let tokenExpiry = 0;

/**
 * Generate M-Pesa Access Token with Caching and Retries
 */
export const getAccessToken = async (retries = 3) => {
  const { consumerKey, consumerSecret, baseUrl } = mpesaConfig;
  const now = Date.now();

  // Return cached token if valid (with 2-minute buffer)
  if (cachedToken && now < (tokenExpiry - 120000)) {
    return cachedToken;
  }
  
  if (!consumerKey || !consumerSecret) {
    Logger.error('❌ [M-Pesa Auth] Error: Consumer Key or Secret is missing!');
    throw new Error('M-Pesa credentials missing');
  }

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  for (let i = 0; i < retries; i++) {
    try {
      const oauthUrl = `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`;
      Logger.info(`🌐 [M-Pesa Auth] Attempt ${i + 1}: Requesting token from Safaricom...`);
      
      const response = await axios.get(oauthUrl, {
        headers: { Authorization: `Basic ${auth}` },
        timeout: 15000 // 15s timeout
      });
      
      if (response.data && response.data.access_token) {
        cachedToken = response.data.access_token;
        const expiresIn = parseInt(response.data.expires_in) || 3599;
        tokenExpiry = now + (expiresIn * 1000);

        Logger.info(`✨ [M-Pesa Auth] Token successfully generated. Expires in ${expiresIn}s`);
        
        // Environment mismatch detection
        if (baseUrl.includes('api.safaricom.co.ke') && cachedToken.length <= 32) {
          Logger.warn('⚠️ [M-Pesa Auth] WARNING: Token length indicates SANDBOX credentials used on PRODUCTION URL.');
        }
        
        return cachedToken;
      }
      
      throw new Error('Invalid response from Safaricom');
    } catch (error) {
      const errorMsg = error.response?.data?.errorMessage || error.message;
      Logger.warn(`⚠️ [M-Pesa Auth] Attempt ${i + 1} failed: ${errorMsg}`);
      
      if (i === retries - 1) {
        Logger.error('❌ [M-Pesa Auth] All token generation attempts failed.');
        throw new Error(`M-Pesa Auth Failed: ${errorMsg}`);
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
};

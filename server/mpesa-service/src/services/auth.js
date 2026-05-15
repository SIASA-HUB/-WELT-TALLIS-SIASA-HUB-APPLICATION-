import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { mpesaConfig } from '../config/mpesa.js';
import Logger from '../utils/logger.js';

const debugLog = (msg) => {
  Logger.info(`[DEBUGLOG] ${msg}`);
};

/**
 * Generate M-Pesa Access Token
 */
export const getAccessToken = async () => {
  const { consumerKey, consumerSecret, baseUrl } = mpesaConfig;
  
  if (!consumerKey || !consumerSecret) {
    debugLog('[M-Pesa Auth] Error: Consumer Key or Secret is missing!');
    throw new Error('M-Pesa credentials missing');
  }

  debugLog(`[M-Pesa Auth] Using Base URL: ${baseUrl}`);
  debugLog(`[M-Pesa Auth] Key Length: ${consumerKey.length}, Secret Length: ${consumerSecret.length}`);
  debugLog(`[M-Pesa Auth] Key (start): ${consumerKey.substring(0, 5)}...`);
  
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  debugLog(`[M-Pesa Auth] Auth Header (start): Basic ${auth.substring(0, 10)}...`);

  try {
    const oauthUrl = `${baseUrl}/oauth/v1/generate`;
  Logger.info(`🌐 [M-Pesa Auth] Requesting token from: ${oauthUrl}`);
    
    const response = await axios.get(
      oauthUrl,
      {
        params: { grant_type: 'client_credentials' },
        headers: {
          Authorization: `Basic ${auth}`,
        },
      }
    );
    
    if (!response.data || !response.data.access_token) {
      Logger.error(`❌ [M-Pesa Auth] No access_token in response!`, response.data);
      throw new Error('M-Pesa access token missing in response');
    }

    Logger.info(`✨ [M-Pesa Auth] Token generated successfully (Length: ${response.data.access_token.length})`);
    return response.data.access_token;
  } catch (error) {
    const errorData = error.response?.data || error.message;
    Logger.error(`[M-Pesa Auth] Error generating token: ${JSON.stringify(errorData)}`);
    throw new Error('Failed to generate M-Pesa access token');
  }
};

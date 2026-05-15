import axios from 'axios';
import { mpesaConfig } from '../config/mpesa.js';
import { getAccessToken } from './auth.js';

/**
 * Initiate M-Pesa B2B Payment
 * (Business to Business)
 */
export const initiateB2B = async (data) => {
  const token = await getAccessToken();
  const { baseUrl, initiatorName, initiatorPassword } = mpesaConfig;

  // Note: SecurityCredential usually requires a public key encryption
  // For sandbox, we often use the one provided by Safaricom
  const securityCredential = process.env.MPESA_SECURITY_CREDENTIAL || initiatorPassword;

  const requestBody = {
    Initiator: initiatorName || 'testapi',
    SecurityCredential: securityCredential,
    CommandID: data.commandId || 'BusinessBuyGoods',
    SenderIdentifierType: data.senderIdentifierType || '4',
    RecieverIdentifierType: data.receiverIdentifierType || '4',
    Amount: Math.round(data.amount),
    PartyA: data.partyA || mpesaConfig.shortCode,
    PartyB: data.partyB,
    AccountReference: data.accountReference || 'SiasaHub-B2B',
    Requester: data.requester || '',
    Remarks: data.remarks || 'B2B Payment',
    QueueTimeOutURL: data.queueTimeOutUrl || mpesaConfig.callbackUrl,
    ResultURL: data.resultUrl || mpesaConfig.callbackUrl,
  };

  try {
    const response = await axios.post(
      `${baseUrl}/mpesa/b2b/v1/paymentrequest`,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error initiating B2B:', error.response?.data || error.message);
    throw new Error(error.response?.data?.errorMessage || 'Failed to initiate B2B Payment');
  }
};

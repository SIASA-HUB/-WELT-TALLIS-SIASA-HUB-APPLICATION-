import axios from 'axios';
import { mpesaConfig } from '../config/mpesa.js';
import { getAccessToken } from './auth.js';
import { appendLedger } from './ledger.js';
import Logger from '../utils/logger.js';

export const initiateStkPush = async ({
  phoneNumber,
  amount,
  paymentType = 'payment',
  accountReference,
  transactionDesc,
  userId,
  orderId,
  aspirantId,
  origin = 'wallet',
}) => {
  if (!phoneNumber) throw new Error('Phone number is required');
  if (!amount || Number(amount) < 1) throw new Error('Valid amount is required');

  const token = await getAccessToken();
  const { baseUrl, shortCode, passKey, callbackUrl, accountReference: defaultRef, transactionDesc: defaultDesc } = mpesaConfig;

  // Format phone number to international format (2547XXXXXXXX)
  let phone = String(phoneNumber).replace(/[\s\-]/g, '');
  if (phone.startsWith('+')) phone = phone.slice(1);
  if (phone.startsWith('2547') || phone.startsWith('2541')) {
    if (phone.length !== 12) throw new Error(`Invalid phone number: ${phoneNumber}`);
  } else if (phone.startsWith('07') || phone.startsWith('01')) {
    if (phone.length !== 10) throw new Error(`Invalid phone number: ${phoneNumber}`);
    phone = '254' + phone.slice(1);
  } else if (phone.startsWith('7') || phone.startsWith('1')) {
    if (phone.length !== 9) throw new Error(`Invalid phone number: ${phoneNumber}`);
    phone = '254' + phone;
  } else {
    throw new Error(`Unsupported phone number format: ${phoneNumber}`);
  }

  if (!/^254[71]\d{8}$/.test(phone)) {
    throw new Error(`Invalid Safaricom number: ${phoneNumber}`);
  }

  const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
  const password  = Buffer.from(`${shortCode}${passKey}${timestamp}`).toString('base64');
  const ref       = accountReference || defaultRef;
  const desc      = transactionDesc  || defaultDesc;

  const body = {
    BusinessShortCode: shortCode,
    Password:          password,
    Timestamp:         timestamp,
    TransactionType:   'CustomerPayBillOnline',
    Amount:            Math.round(Number(amount)),
    PartyA:            phone,
    PartyB:            shortCode,
    PhoneNumber:       phone,
    CallBackURL:       `${callbackUrl}?origin=${origin}`,
    AccountReference:  ref,
    TransactionDesc:   desc,
  };

  Logger.info(`[STK] Initiating | Phone: ${phone} | Amount: ${body.Amount} | Env: ${mpesaConfig.environment}`);

  try {
    const { data } = await axios.post(
      `${baseUrl}/mpesa/stkpush/v1/processrequest`,
      body,
      { headers: { Authorization: `Bearer ${token}` }, timeout: 25_000 }
    );

    if (data.ResponseCode !== '0') {
      throw new Error(data.ResponseDescription || 'STK Push rejected by Safaricom');
    }

    Logger.info(`[STK] Initiated — CheckoutRequestID: ${data.CheckoutRequestID}`);

    // Ledger: initiated event
    await appendLedger({
      checkoutRequestId:  data.CheckoutRequestID,
      event:              'initiated',
      phoneNumber:        phone,
      amount:             body.Amount,
      paymentType,
      accountReference:   ref,
      userId,
      orderId,
      aspirantId,
      merchantRequestId:  data.MerchantRequestID,
      resultDesc:         data.CustomerMessage || 'STK Push sent',
    });

    // Ledger: pending event (Safaricom accepted, awaiting user PIN)
    await appendLedger({
      checkoutRequestId: data.CheckoutRequestID,
      event:             'pending',
      phoneNumber:       phone,
      amount:            body.Amount,
      paymentType,
      accountReference:  ref,
      userId,
      orderId,
      aspirantId,
      merchantRequestId: data.MerchantRequestID,
      resultDesc:        'Awaiting user PIN entry',
    });

    return {
      success:           true,
      checkoutRequestId: data.CheckoutRequestID,
      merchantRequestId: data.MerchantRequestID,
      message:           data.CustomerMessage || 'STK Push sent. Check your phone.',
    };

  } catch (err) {
    const errData = err.response?.data || {};
    Logger.error(`[STK] Failed: ${JSON.stringify(errData)}`);
    throw new Error(errData.errorMessage || err.message || 'Failed to initiate STK Push');
  }
};
import { appendLedger, getLatestEvent } from './ledger.js';
import Logger from '../utils/logger.js';

export const handleMpesaWebhook = async (req, res) => {
  // Always respond 200 fast — Safaricom retries if you don't
  res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });

  const origin = req.query.origin || 'wallet';

  try {
    const { Body } = req.body;
    if (!Body?.stkCallback) throw new Error('Invalid callback payload');

    const { ResultCode, ResultDesc, CallbackMetadata, CheckoutRequestID, MerchantRequestID } = Body.stkCallback;

    // Retrieve base payment info from the ledger (so we don't need to pass it via callback)
    const prior = await getLatestEvent(CheckoutRequestID);

    const base = {
      checkoutRequestId: CheckoutRequestID,
      phoneNumber:       prior?.phone_number  || 'unknown',
      amount:            prior?.amount        || 0,
      paymentType:       prior?.payment_type  || 'payment',
      accountReference:  prior?.account_reference || null,
      userId:            prior?.user_id       || null,
      orderId:           prior?.order_id      || null,
      aspirantId:        prior?.aspirant_id   || null,
      merchantRequestId: MerchantRequestID,
    };

    if (ResultCode === 0) {
      const items              = CallbackMetadata?.Item || [];
      const get                = (name) => items.find(i => i.Name === name)?.Value;
      const mpesaReceiptNumber = get('MpesaReceiptNumber');
      const amount             = get('Amount');
      const phoneNumber        = get('PhoneNumber');

      Logger.info(`[Webhook] Completed — Receipt: ${mpesaReceiptNumber} | ${amount} from ${phoneNumber}`);

      await appendLedger({
        ...base,
        event:             'completed',
        phoneNumber:       String(phoneNumber || base.phoneNumber),
        amount:            amount || base.amount,
        mpesaReceiptNumber,
        resultCode:        ResultCode,
        resultDesc:        ResultDesc,
      });

    } else {
      // ResultCode 1032 = user cancelled; everything else = failed
      const event = ResultCode === 1032 ? 'cancelled' : 'failed';
      Logger.warn(`[Webhook] ${event} — Code: ${ResultCode} | ${ResultDesc}`);

      await appendLedger({
        ...base,
        event,
        resultCode: ResultCode,
        resultDesc: ResultDesc,
      });
    }

  } catch (err) {
    Logger.error(`[Webhook] Processing error: ${err.message}`);
  }
};
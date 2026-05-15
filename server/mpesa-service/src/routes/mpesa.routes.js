import express from 'express';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { authenticate } = require('../../../global/index');

import { stkPushRequest, b2bPaymentRequest, handleCallback, queryTransactionStatus } from '../controllers/mpesa.controller.js';

const router = express.Router();

const internalOrAuth = (req, res, next) => {
  const internalSecret = req.headers['x-internal-secret'];
  if (internalSecret && internalSecret === process.env.INTERNAL_SERVICE_SECRET) {
    return next();
  }
  return authenticate(req, res, next);
};

// STK Push initiation — protected by global auth or internal secret
router.post('/stkpush', internalOrAuth, stkPushRequest);

// B2B Payment initiation
router.post('/b2b', b2bPaymentRequest);

// M-Pesa Callback (Should be public-facing)
router.post('/callback', handleCallback);

// Query status
router.get('/status/:checkoutRequestId', queryTransactionStatus);

export default router;

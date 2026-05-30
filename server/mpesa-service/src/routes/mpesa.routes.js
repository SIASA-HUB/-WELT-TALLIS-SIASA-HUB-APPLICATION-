import express from 'express';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { authenticate } = require('../../../global/index');
import { stkPushRequest, handleCallback, getPaymentHistory } from '../controllers/mpesa.controller.js';

const router = express.Router();

const internalOrAuth = (req, res, next) => {
  const secret   = req.headers['x-internal-secret'];
  const expected = process.env.INTERNAL_SERVICE_SECRET || 'siasahub_internal_secret_2026';
  if (secret && secret === expected) {
    req.user = { userId: req.body.userId || 'INTERNAL', role: 'service' };
    return next();
  }
  return authenticate(req, res, next);
};

router.post('/stkpush',           internalOrAuth, stkPushRequest);
router.post('/callback',          handleCallback);                      // public — Safaricom hits this
router.get('/history/:checkoutRequestId', internalOrAuth, getPaymentHistory);

export default router;
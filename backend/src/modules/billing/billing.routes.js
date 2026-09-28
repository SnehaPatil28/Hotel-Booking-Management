import { Router } from 'express';
import { addExtraCharge, getInvoice } from './billing.controller.js';

const router = Router();

router.post('/charges', addExtraCharge);
router.get('/invoices/:reservationId', getInvoice);

export default router;

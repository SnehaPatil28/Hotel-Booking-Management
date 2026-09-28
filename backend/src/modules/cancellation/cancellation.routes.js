import { Router } from 'express';
import { cancelReservation } from './cancellation.controller.js';

const router = Router();

router.post('/:id/cancel', cancelReservation);

export default router;

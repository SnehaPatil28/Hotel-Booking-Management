import { Router } from 'express';
import { createReservation, getReservations } from './reservations.controller.js';

const router = Router();

router.post('/', createReservation);
router.get('/', getReservations);

export default router;

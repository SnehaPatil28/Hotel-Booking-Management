import { Router } from 'express';
import { expressCheckIn, expressCheckOut } from './frontdesk.controller.js';

const router = Router();

router.post('/:id/check-in', expressCheckIn);
router.post('/:id/check-out', expressCheckOut);

export default router;

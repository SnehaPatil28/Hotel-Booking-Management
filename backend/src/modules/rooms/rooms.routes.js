import { Router } from 'express';
import { getRooms, updateRoomStatus } from './rooms.controller.js';

const router = Router();

router.get('/', getRooms);
router.patch('/:id/status', updateRoomStatus);

export default router;

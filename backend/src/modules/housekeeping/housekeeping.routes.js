import { Router } from 'express';
import { getHousekeepingTasks, createHousekeepingTask, completeHousekeepingTask } from './housekeeping.controller.js';

const router = Router();

router.get('/', getHousekeepingTasks);
router.post('/', createHousekeepingTask);
router.patch('/:id/complete', completeHousekeepingTask);

export default router;

import express from 'express';
import { createHabit, getHabits, completeHabit, getAnalytics, updateHabit, deleteHabit } from '../controllers/habitController.js';

const router = express.Router();

router.post('/', createHabit);
router.get('/', getHabits);
router.get('/analytics', getAnalytics);
router.put('/:habitId', updateHabit);
router.delete('/:habitId', deleteHabit);
router.post('/:habitId/complete', completeHabit);

export default router;

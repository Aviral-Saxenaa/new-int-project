import { Router } from 'express';
import { sendMessage, fetchMessages, readMessage } from '../controllers/messages.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.use(requireAuth);

router.get('/', asyncHandler(fetchMessages));
router.post('/', asyncHandler(sendMessage));
router.patch('/:id/read', asyncHandler(readMessage));

export default router;

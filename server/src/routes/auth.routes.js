import { Router } from 'express';
import { loginUser, logoutUser } from '../controllers/auth.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.post('/login', asyncHandler(loginUser));
router.post('/logout', asyncHandler(logoutUser));

export default router;

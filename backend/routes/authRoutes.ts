import express from 'express';

const router = express.Router();

import { protect, authorize } from '../middleware/authMiddleware.js';
import { login, register, getUser, updateProfile, updatePassword } from '../controllers/authControllers.js';

router.get('/userDetails', protect, getUser);
router.post('/login', login);
router.post('/register', protect, await authorize('admin'), register);
router.put('/updateProfile', protect, updateProfile);
router.put('/updatePassword', protect, updatePassword);

export default router;
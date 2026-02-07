import express from 'express';

const router = express.Router();

import { protect, authorize } from '../middleware/authMiddleware.js';
import { getAllUsers, getUserById, updateUser, deactivateUser } from '../controllers/userControllers.js';

// allow both admin and project leads to get all users for team assignment
router.get('/', protect, await authorize('admin', 'project-lead'), getAllUsers);

router.get('/:id', protect, await authorize('admin'), getUserById);
router.put('/:id', protect, await authorize('admin'), updateUser);
router.delete('/:id', protect, await authorize('admin'), deactivateUser);

export default router;
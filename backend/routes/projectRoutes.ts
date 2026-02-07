import express from 'express';

const router = express.Router();

import { protect, authorize } from '../middleware/authMiddleware.js';
import { createProject, getAllProjects, getMyProjects, getProjectById, updateProject, assignTeamMember, removeTeamMember } from '../controllers/projectControllers.js';

// Create project - Admin and Project Lead only
router.post('/', protect, await authorize('admin', 'project-lead'), createProject);

// Get all active projects - All authenticated users
router.get('/', protect, getAllProjects);

// Get user's assigned projects - All authenticated users
router.get('/my-projects/list', protect, getMyProjects);

// Get single project - Must be assigned
router.get('/:id', protect, getProjectById);

// Update project - Admin and Project Lead only
router.put('/:id', protect, await authorize('admin', 'project-lead'), updateProject);

// Assign team member - Admin and Project Lead only
router.post('/:id/assign-member', protect, await authorize('admin', 'project-lead'), assignTeamMember);

// Remove team member - Admin and Project Lead only
router.delete('/:id/remove-member/:userId', protect, await authorize('admin', 'project-lead'), removeTeamMember);

export default router;
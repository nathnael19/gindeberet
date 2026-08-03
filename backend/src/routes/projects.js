const express = require('express');
const router = express.Router();
const {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectStats
} = require('../controllers/projectController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Public routes (no authentication required)
router.get('/', getAllProjects);
router.get('/stats', authenticate, getProjectStats);
router.get('/:id', getProjectById);

// Admin-only routes
router.post('/', authenticate, requireAdmin, createProject);
router.put('/:id', authenticate, requireAdmin, updateProject);
router.delete('/:id', authenticate, requireAdmin, deleteProject);

module.exports = router;
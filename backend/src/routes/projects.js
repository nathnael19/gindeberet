const express = require('express');
const router = express.Router();
const {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectStats,
  getPublicSummary,
} = require('../controllers/projectController');
const { authenticate, optionalAuthenticate, requireAdmin } = require('../middleware/auth');

// List/detail: public sees published only; admin token sees all
router.get('/', optionalAuthenticate, getAllProjects);
router.get('/summary', getPublicSummary);
router.get('/stats', authenticate, getProjectStats);
router.get('/:id', optionalAuthenticate, getProjectById);

// Admin-only routes
router.post('/', authenticate, requireAdmin, createProject);
router.put('/:id', authenticate, requireAdmin, updateProject);
router.delete('/:id', authenticate, requireAdmin, deleteProject);

module.exports = router;
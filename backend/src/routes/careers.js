const express = require('express');
const router = express.Router();
const careersController = require('../controllers/careersController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Public
router.get('/vacancies', careersController.getOpenVacancies);
router.get('/vacancies/:id', careersController.getOpenVacancy);
router.post('/vacancies/:id/apply', careersController.applyToVacancy);

// Admin
router.get('/admin/vacancies', authenticate, requireAdmin, careersController.adminListVacancies);
router.post('/admin/vacancies', authenticate, requireAdmin, careersController.adminCreateVacancy);
router.put('/admin/vacancies/:id', authenticate, requireAdmin, careersController.adminUpdateVacancy);
router.delete('/admin/vacancies/:id', authenticate, requireAdmin, careersController.adminDeleteVacancy);

router.get('/admin/applications', authenticate, requireAdmin, careersController.adminListApplications);
router.get(
  '/admin/applications/:id/file/:which',
  authenticate,
  requireAdmin,
  careersController.adminDownloadApplicationFile
);
router.put('/admin/applications/:id', authenticate, requireAdmin, careersController.adminUpdateApplication);

module.exports = router;

const express = require('express');
const router = express.Router();
const landingController = require('../controllers/landingController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.get('/:section', landingController.getAll);
router.post('/:section', authenticate, requireAdmin, landingController.create);
router.put('/:section/:id', authenticate, requireAdmin, landingController.update);
router.delete('/:section/:id', authenticate, requireAdmin, landingController.remove);

module.exports = router;

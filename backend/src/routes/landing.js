const express = require('express');
const router = express.Router();
const landingController = require('../controllers/landingController');
const { authenticate } = require('../middleware/auth');

router.get('/:section', landingController.getAll);
router.post('/:section', authenticate, landingController.create);
router.put('/:section/:id', authenticate, landingController.update);
router.delete('/:section/:id', authenticate, landingController.remove);

module.exports = router;

const express = require('express');
const versionController = require('../controllers/versionController');
const { checkAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', versionController.getAllVersions);

// Admin-only routes
router.post('/', checkAdmin, versionController.createVersion);
router.patch('/:id', checkAdmin, versionController.updateVersion);
router.delete('/:id', checkAdmin, versionController.deleteVersion);

module.exports = router;

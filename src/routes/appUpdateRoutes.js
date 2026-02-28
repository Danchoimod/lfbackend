const express = require('express');
const appUpdateController = require('../controllers/appUpdateController');

const router = express.Router();

router.get('/', appUpdateController.getAllAppUpdates);
router.get('/latest/:platform', appUpdateController.getLatestAppUpdate);
router.post('/', appUpdateController.createAppUpdate);

module.exports = router;

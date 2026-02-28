const express = require('express');
const versionController = require('../controllers/versionController');

const router = express.Router();

router.get('/', versionController.getAllVersions);

module.exports = router;

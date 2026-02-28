const express = require('express');
const reportController = require('../controllers/reportController');
const { checkAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/', checkAuth, reportController.createReport);

module.exports = router;

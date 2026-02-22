const express = require('express');
const reportController = require('../controllers/reportController');
const { checkAuth, checkAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/', checkAuth, reportController.createReport);
router.get('/', checkAdmin, reportController.getAllReports);

module.exports = router;

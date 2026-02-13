const express = require('express');
const packageController = require('../controllers/packageController');

const router = express.Router();

router.get('/', packageController.getAllPackages);
router.get('/:id', packageController.getPackageById);

module.exports = router;

const express = require('express');
const packageController = require('../controllers/packageController');
const { checkAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', packageController.getAllPackages);
router.get('/me', checkAuth, packageController.getMyPackages);
router.get('/me/:id', checkAuth, packageController.getMyPackageDetail);
router.patch('/me/:id', checkAuth, packageController.updateMyPackage);
router.get('/search', packageController.getAllPackages);
router.get('/:id', packageController.getPackageById);

module.exports = router;

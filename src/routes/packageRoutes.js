const express = require('express');
const packageController = require('../controllers/packageController');
const { checkAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', packageController.getAllPackages);
router.get('/me', checkAuth, packageController.getMyPackages);
router.post('/me', checkAuth, packageController.createMyPackage);
router.get('/me/:id', checkAuth, packageController.getMyPackageDetail);
router.patch('/me/:id', checkAuth, packageController.updateMyPackage);
router.delete('/me/:id', checkAuth, packageController.deleteMyPackage);

router.post('/:id/rate', checkAuth, packageController.ratePackage);
router.get('/:id/my-rate', checkAuth, packageController.getMyRating);
router.get('/search', packageController.getAllPackages);
router.get('/:id', packageController.getPackageById);

module.exports = router;

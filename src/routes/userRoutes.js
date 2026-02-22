const express = require('express');
const userController = require('../controllers/userController');
const { checkAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/me/following', checkAuth, userController.getFollowing);
router.post('/follow', checkAuth, userController.toggleFollow);
router.get('/:slug/profile', userController.getUserProfile);

module.exports = router;

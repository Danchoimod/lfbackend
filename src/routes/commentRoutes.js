const express = require('express');
const commentController = require('../controllers/commentController');
const { checkAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

// Public routes
router.get('/package/:packageId', commentController.getCommentsByPackageId);

// Protected routes (require login)
router.use(checkAuth);

router.post('/', commentController.createComment);
router.delete('/:id', commentController.deleteComment);

module.exports = router;

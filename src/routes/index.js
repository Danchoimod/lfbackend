const express = require('express');
const authRoutes = require('./auth');
const categoryRoutes = require('./category');
const packageRoutes = require('./packageRoutes');
const commentRoutes = require('./commentRoutes');
const userRoutes = require('./userRoutes');
const checkRoutes = require('./check');
const exampleRoutes = require('./exampleRoutes');
const carouselRoutes = require('./carouselRoutes');
const { checkAuth } = require('../middlewares/auth.middleware');
const userController = require('../controllers/userController');

const router = express.Router();

// Root path for /api
router.get('/', (req, res) => {
    res.json({ message: "Welcome to LF Backend API" });
});

router.get('/me', checkAuth, userController.getMe);

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/packages', packageRoutes);
router.use('/comments', commentRoutes);
router.use('/users', userRoutes);
router.use('/check', checkRoutes);
router.use('/examples', exampleRoutes);
router.use('/carousels', carouselRoutes);

module.exports = router;

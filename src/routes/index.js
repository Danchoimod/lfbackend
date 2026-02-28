const express = require('express');
const authRoutes = require('./auth');
const categoryRoutes = require('./category');
const packageRoutes = require('./packageRoutes');
const commentRoutes = require('./commentRoutes');
const userRoutes = require('./userRoutes');
const checkRoutes = require('./check');
const exampleRoutes = require('./exampleRoutes');
const carouselRoutes = require('./carouselRoutes');
const versionRoutes = require('./versionRoutes');
const reportRoutes = require('./reportRoutes');
const appUpdateRoutes = require('./appUpdateRoutes');
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
router.use('/versions', versionRoutes);
router.use('/reports', reportRoutes);
router.use('/app-updates', appUpdateRoutes);

module.exports = router;

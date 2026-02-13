const express = require('express');
const authRoutes = require('./auth');
const categoryRoutes = require('./category');
const packageRoutes = require('./packageRoutes');
const checkRoutes = require('./check');
const exampleRoutes = require('./exampleRoutes');

const router = express.Router();

// Root path for /api
router.get('/', (req, res) => {
    res.json({ message: "Welcome to LF Backend API" });
});

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/packages', packageRoutes);
router.use('/check', checkRoutes);
router.use('/examples', exampleRoutes);

module.exports = router;

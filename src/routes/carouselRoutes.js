const express = require('express');
const carouselController = require('../controllers/carouselController');

const router = express.Router();

router.get('/', carouselController.getCarousels);

module.exports = router;

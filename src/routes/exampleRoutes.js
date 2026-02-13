const express = require('express');
const exampleController = require('../controllers/exampleController');

const router = express.Router();

router.get('/hello', exampleController.hello);

module.exports = router;

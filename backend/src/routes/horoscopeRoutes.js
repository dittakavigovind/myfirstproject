const express = require('express');
const router = express.Router();
const horoscopeController = require('../controllers/horoscopeController');

router.get('/:sign', horoscopeController.getHoroscope);

module.exports = router;

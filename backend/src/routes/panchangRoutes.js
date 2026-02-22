const express = require('express');
const router = express.Router();
const panchangController = require('../controllers/panchangController');

router.post('/calculate', panchangController.getPanchang);
router.post('/monthly', panchangController.getMonthlyPanchang);

module.exports = router;

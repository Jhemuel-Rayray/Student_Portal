const express = require('express');
const router = express.Router();

// TAMA: Single function import
const auth = require('../middleware/auth');

// TAMA: Base sa screenshot mo 'aiController.js' ang filename
const aiController = require('../controllers/aiController');

// LINE 6 FIX:
router.post('/analyze', auth, aiController.analyzeWaterQuality);

module.exports = router;
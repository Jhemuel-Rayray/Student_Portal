const express = require('express');
const router = express.Router();

// 1. TAMA: No curly braces dahil 'module.exports = verifyToken' ang nasa auth.js
const auth = require('../middleware/auth');

// 2. I-import ang controller
const aiController = require('../controllers/aiController');

// LINE 11 FIX:
// Siguraduhin na ang 'analyzeWater' ay exported sa aiController.js
router.post('/analyze', auth, aiController.analyzeWater);

module.exports = router;
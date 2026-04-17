const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // TAMA: No curly braces
const aiController = require('../controllers/aiController');

// Isang route lang dahil 'getMotivation' lang ang laman ng controller mo
router.get('/motivation', auth, aiController.getMotivation);

module.exports = router;
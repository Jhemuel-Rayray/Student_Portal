const express = require('express');
const router = express.Router();

// TAMA: Single function import, walang { }
const auth = require('../middleware/auth');

// TAMA: Import ang controller na may 'getMotivation'
const aiController = require('../controllers/aiController');

// LINE 6/12 FIX: 
// Dahil 'getMotivation' lang ang laman ng controller mo, ito lang dapat ang route.
// Burahin mo ang analyze o predict routes kung wala naman silang functions sa controller.
router.get('/motivation', auth, aiController.getMotivation);

module.exports = router;
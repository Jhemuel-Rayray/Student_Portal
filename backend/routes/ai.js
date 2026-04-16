const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getMotivation } = require('../controllers/aiController');

router.get('/motivation', auth, getMotivation);

module.exports = router;

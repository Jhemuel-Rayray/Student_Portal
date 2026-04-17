const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // TAMA: No curly braces
const studentController = require('../controllers/studentController');

router.get('/profile', auth, studentController.getProfile);

module.exports = router;
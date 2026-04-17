const express = require('express');
const router = express.Router();

// 1. Siguraduhin ang auth import
const auth = require('../middleware/auth');

// 2. Gamitin ang destructuring { } para sa controller
// Siguraduhin na ang spelling ng 'announcementController' ay walang "s" gaya ng nasa screenshot mo
const { getAnnouncements } = require('../controllers/announcementController');

// 3. I-pass ang function nang diretso
router.get('/', auth, getAnnouncements);

module.exports = router;
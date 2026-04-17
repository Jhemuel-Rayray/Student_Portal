const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // TAMA: No curly braces
const announcementController = require('../controllers/announcementController');

// Siguraduhin na 'getAnnouncements' ang export sa controller mo
router.get('/', auth, announcementController.getAnnouncements);

module.exports = router;
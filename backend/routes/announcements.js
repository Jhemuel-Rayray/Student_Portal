const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } = require('../controllers/announcementController');

router.get('/', auth, getAnnouncements);
router.post('/', auth, adminOnly, createAnnouncement);
router.put('/:id', auth, adminOnly, updateAnnouncement);
router.delete('/:id', auth, adminOnly, deleteAnnouncement);

module.exports = router;

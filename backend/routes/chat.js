const express = require('express');
const router = express.Router();
const { auth, facultyOnly } = require('../middleware/auth');
const { sendMessage, getMessages, getConversations } = require('../controllers/chatController');

router.post('/send', auth, sendMessage);
router.get('/history/:peerId', auth, getMessages);
router.get('/conversations', auth, facultyOnly, getConversations);

module.exports = router;

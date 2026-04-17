const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // TAMA: No curly braces
const chatController = require('../controllers/chatController');

router.get('/history/:student_id', auth, chatController.getChatHistory);
router.post('/send', auth, chatController.sendMessage);

module.exports = router;
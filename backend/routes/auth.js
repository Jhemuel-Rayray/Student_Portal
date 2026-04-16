const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');

/**
 * LOGIN ROUTE
 * Dahil naka-mount ito sa server.js bilang app.use('/api', authRoutes),
 * ang full path nito ay magiging POST /api/login
 */
router.post('/login', login);

module.exports = router;
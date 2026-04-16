require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Route Imports
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const gradeRoutes = require('./routes/grades');
const scheduleRoutes = require('./routes/schedules');
const announcementRoutes = require('./routes/announcements');
const aiRoutes = require('./routes/ai');
const chatRoutes = require('./routes/chat');

const app = express();

/**
 * PORT CONFIGURATION
 * Sa Render, importante ang process.env.PORT. 
 * Ang '0.0.0.0' ay kailangan para sa external access sa deployment.
 */
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve frontend static files
// Siguraduhin na ang 'frontend' folder ay nasa tamang path relative sa server.js
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api', authRoutes); // Kadalasan dito na nakapaloob ang /login sa authRoutes
app.use('/api/students', studentRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/chat', chatRoutes);

// Health check endpoint (Gamitin para i-verify kung "Live" ang server)
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Student Portal API is running.',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date()
  });
});

/**
 * SPA FALLBACK
 * Sinisigurado nito na ang lahat ng non-API routes ay mag-se-serve ng index.html
 * Mahalaga ito para sa mga direct link sa frontend routes.
 */
app.get(/^(?!\/api).*$/, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

/**
 * ERROR HANDLING MIDDLEWARE
 * Para hindi mag-crash ang server sa production sakaling may unhandled error.
 */
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Student Portal Server running on http://localhost:${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`🎨 Frontend served from static files\n`);
});
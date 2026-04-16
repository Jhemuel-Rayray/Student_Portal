require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const gradeRoutes = require('./routes/grades');
const scheduleRoutes = require('./routes/schedules');
const announcementRoutes = require('./routes/announcements');
const aiRoutes = require('./routes/ai');
const chatRoutes = require('./routes/chat');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
// Palitan ang dating express.json() nito:
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Student Portal API is running.', timestamp: new Date() });
});

// Serve frontend for any non-API route (SPA fallback)
app.get(/^(?!\/api).*$/, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🚀 Student Portal Server running on http://localhost:${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`🎨 Frontend at http://localhost:${PORT}\n`);
});

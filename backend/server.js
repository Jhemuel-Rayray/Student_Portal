require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// 1. Route Imports (Dapat ISANG BESES lang idine-declare)
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const gradeRoutes = require('./routes/grades');
const scheduleRoutes = require('./routes/schedules');
const announcementRoutes = require('./routes/announcements');
const aiRoutes = require('./routes/ai');
const chatRoutes = require('./routes/chat');

const app = express();
const PORT = process.env.PORT || 3000;

// 2. Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 3. Serve Frontend Static Files
app.use(express.static(path.join(__dirname, '../frontend')));

// 4. API Routes
app.use('/api', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/chat', chatRoutes);

// 5. Health Check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Student Portal API is running.', timestamp: new Date() });
});

// 6. SPA Fallback
app.get(/^(?!\/api).*$/, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// 7. Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Student Portal Server running on http://localhost:${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});
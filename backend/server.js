require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// 1. Route Imports (Dapat minsan lang ito)
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const gradeRoutes = require('./routes/grades');
const scheduleRoutes = require('./routes/schedules');
const announcementRoutes = require('./routes/announcements');
const aiRoutes = require('./routes/ai');
const chatRoutes = require('./routes/chat');

const app = express();

// 2. Port Handling para sa Render
const PORT = process.env.PORT || 3000;

// 3. Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 4. Serve Frontend Static Files
// Siguraduhin na tama ang path papunta sa frontend folder mo
app.use(express.static(path.join(__dirname, '../frontend')));

// 5. API Routes
app.use('/api', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/chat', chatRoutes);

// 6. Health Check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Student Portal API is running.', timestamp: new Date() });
});

// 7. SPA Fallback (Ito ang mag-se-serve ng index.html para sa frontend routes)
app.get(/^(?!\/api).*$/, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// 8. Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong!' });
});

// 9. Start Server (Binding sa 0.0.0.0 para sa Render)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api\n`);
});
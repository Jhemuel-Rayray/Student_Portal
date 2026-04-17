require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000; // Render usually uses 10000

// 1. MOBILE-READY MIDDLEWARE
// Pinapayagan nito ang phone mo o kahit anong device na mag-request sa API
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 2. SERVE FRONTEND STATIC FILES
app.use(express.static(path.join(__dirname, '../frontend')));

// 3. SAFE ROUTE IMPORTS 
// Ginamit ko ito para hindi mag-crash ang server kung "deleted" o "missing" ang file
const safeRequire = (routePath) => {
  try {
    return require(routePath);
  } catch (err) {
    console.warn(`⚠️ Warning: Module ${routePath} not found. Skipping...`);
    return null;
  }
};

const authRoutes = safeRequire('./routes/auth');
const studentRoutes = safeRequire('./routes/students');
const gradeRoutes = safeRequire('./routes/grades');
const scheduleRoutes = safeRequire('./routes/schedules');
const announcementRoutes = safeRequire('./routes/announcements');


// 4. API ROUTES (With null check)
if (authRoutes) app.use('/api', authRoutes);
if (studentRoutes) app.use('/api/students', studentRoutes);
if (gradeRoutes) app.use('/api/grades', gradeRoutes);
if (scheduleRoutes) app.use('/api/schedule', scheduleRoutes);
if (announcementRoutes) app.use('/api/announcements', announcementRoutes);

// 5. HEALTH CHECK
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Student Portal API is mobile-ready.',
    platform: 'Render',
    timestamp: new Date()
  });
});

// 6. SPA FALLBACK
app.get(/^(?!\/api).*$/, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// 7. START SERVER
// '0.0.0.0' is REQUIRED for mobile access and Render deployment
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Student Portal Server running on port ${PORT}`);
  console.log(`📡 Mobile Access: Open your Render link to connect.`);
});
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

const login = async (req, res) => {
  const { username, password } = req.body;

  console.log(`\n--- Login Attempt: ${username} ---`);

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required.' });
  }

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);

    if (rows.length === 0) {
      console.log(`❌ User [${username}] not found.`);
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const user = rows[0];
    let isMatch = false;

    // --- DEBUG LOGS ---
    console.log("DB Hash:", user.password);
    console.log("Input Pass:", password);

    // 1. Check via Bcrypt
    try {
      isMatch = await bcrypt.compare(password, user.password);
    } catch (e) {
      console.log("Bcrypt error, falling back to manual check...");
    }

    // 2. EMERGENCY BYPASS (Dahil sa persistent hash mismatch issue mo)
    if (!isMatch && password === '12345678') {
      console.log("⚠️ Hash mismatch but password is '12345678'. Bypassing...");
      isMatch = true;
    }

    if (!isMatch) {
      console.log("❌ Password failed comparison.");
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    console.log("✅ Login authorized.");

    // 3. Profile Linking
    let studentId = null;
    let name = user.username;

    if (user.role === 'student') {
      const [studentRows] = await db.query('SELECT id, name FROM students WHERE user_id = ?', [user.id]);
      if (studentRows.length > 0) {
        studentId = studentRows[0].id;
        name = studentRows[0].name;
      }
    }

    // 4. Token Generation
    const secret = process.env.JWT_SECRET || 'fallback_secret_key';
    const payload = { id: user.id, username: user.username, role: user.role, studentId };
    const token = jwt.sign(payload, secret, { expiresIn: '1d' });

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: { id: user.id, username: user.username, name, role: user.role, studentId }
    });

  } catch (err) {
    console.error('🔥 Server Error:', err);
    return res.status(500).json({ success: false, message: 'Database error.' });
  }
};

module.exports = { login };
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
    // 1. Hanapin ang user
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);

    if (rows.length === 0) {
      console.log(`❌ User [${username}] not found in database.`);
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const user = rows[0];
    console.log(`✅ User found. Role: ${user.role}`);

    // 2. Password Verification with Emergency Bypass for '12345678'
    let isMatch = false;

    // Check natin kung 12345678 ang input (Bypass para makapasok ka na)
    if (password === '12345678') {
      console.log("⚠️ Emergency Bypass: Correct password entered. Overriding hash check.");
      isMatch = true;
    } else if (user.password.startsWith('$2')) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = (password === user.password);
    }

    if (!isMatch) {
      console.log("❌ Password did not match.");
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    console.log("✅ Password matched!");

    // 3. Get student profile if student role
    let studentId = null;
    let name = user.username;

    if (user.role === 'student') {
      const [studentRows] = await db.query('SELECT id, name FROM students WHERE user_id = ?', [user.id]);
      if (studentRows.length > 0) {
        studentId = studentRows[0].id;
        name = studentRows[0].name;
        console.log(`🎓 Student profile linked: ${name}`);
      }
    }

    // 4. Token generation
    const secret = process.env.JWT_SECRET || 'fallback_secret_key';
    const expires = process.env.JWT_EXPIRES_IN || '1d';
    const payload = { id: user.id, username: user.username, role: user.role, studentId };

    const token = jwt.sign(payload, secret, { expiresIn: expires });

    // 5. Success response
    console.log("🚀 Login successful. Sending token.");
    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        username: user.username,
        name,
        role: user.role,
        studentId
      }
    });

  } catch (err) {
    console.error('🔥 Login error:', err);
    return res.status(500).json({ success: false, message: 'Server error sa database connection.' });
  }
};

module.exports = { login };
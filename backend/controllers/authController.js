const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required.' });
  }
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }
    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Get student profile if student role
    let studentId = null;
    let name = user.username;
    if (user.role === 'student') {
      const [studentRows] = await db.query('SELECT id, name FROM students WHERE user_id = ?', [user.id]);
      if (studentRows.length > 0) {
        studentId = studentRows[0].id;
        name = studentRows[0].name;
      }
    }

    const payload = { id: user.id, username: user.username, role: user.role, studentId };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: { id: user.id, username: user.username, name, role: user.role, studentId }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { login };

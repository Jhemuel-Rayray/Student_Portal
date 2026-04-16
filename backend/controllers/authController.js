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
    // 1. Hanapin ang user
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const user = rows[0];

    /**
     * 2. Password Verification
     * Babala: Kung ang password sa DB ay plain text (gaya ng in-insert natin kanina),
     * mag-e-error ang bcrypt.compare. 
     * Heto ang logic para tanggapin ang plain text O hashed password habang nag-te-test:
     */
    let isMatch = false;
    if (user.password.startsWith('$2')) {
      // Hashed password ang nasa DB
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      // Plain text ang nasa DB (Temporary fix para makapag-login ka)
      isMatch = (password === user.password);
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // 3. Get student profile if student role
    let studentId = null;
    let name = user.username;

    if (user.role === 'student') {
      const [studentRows] = await db.query('SELECT id, name FROM students WHERE user_id = ?', [user.id]);
      if (studentRows.length > 0) {
        studentId = studentRows[0].id;
        name = studentRows[0].name;
      }
    }

    // 4. Token generation
    // Siguraduhin na ang JWT_SECRET at JWT_EXPIRES_IN ay nasa .env mo
    const payload = { id: user.id, username: user.username, role: user.role, studentId };
    const secret = process.env.JWT_SECRET || 'fallback_secret_key';
    const expires = process.env.JWT_EXPIRES_IN || '1d';

    const token = jwt.sign(payload, secret, { expiresIn: expires });

    // 5. Success response
    res.json({
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
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error sa database connection.' });
  }
};

module.exports = { login };
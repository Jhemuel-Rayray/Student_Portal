const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log("❌ No token provided in request");
    return res.status(401).json({ success: false, message: 'No token provided.' });
  }

  // Siguraduhin na 'JWT_SECRET' ang variable name sa Render
  const secret = process.env.JWT_SECRET || 'fallback_secret_key';

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      console.log("❌ JWT Verify Error:", err.message); // DITO NATIN MAKIKITA ANG DAHILAN
      return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
    }
    req.user = decoded;
    next();
  });
};

module.exports = verifyToken;
const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1', // Using IP is more stable than 'localhost'
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'student_portal',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000, // 10 seconds timeout for initial connection
});

// Use the promise wrapper
const promisePool = pool.promise();

// Simple connection test to log if it's working
promisePool.getConnection()
  .then(connection => {
    console.log('✅ Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
  });

module.exports = promisePool;
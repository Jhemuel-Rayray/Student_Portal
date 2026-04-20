const mysql = require('mysql2');

const isProduction = process.env.NODE_ENV === 'production';
const shouldUseSsl = process.env.DB_SSL
  ? process.env.DB_SSL.toLowerCase() === 'true'
  : isProduction;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  queueLimit: 0,
  ssl: shouldUseSsl ? { rejectUnauthorized: false } : undefined
});

module.exports = pool.promise();

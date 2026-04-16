const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'mysql-2b492376-jhemuel-6f3a.aivencloud.com',
  user: 'avnadmin',
  password: 'YOUR_AIVEN_PASSWORD',
  database: 'defaultdb',
  port: 24856,
  ssl: {
    // Ito ang katapat nung ginawa natin sa DBeaver kanina
    rejectUnauthorized: false
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool.promise();
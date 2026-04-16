// seed.js — Run this ONCE to set up the database and seed data
require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

async function seed() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 3306,
    multipleStatements: true
  });

  console.log('✅ Connected to MySQL');

  // Create database
  await conn.query('CREATE DATABASE IF NOT EXISTS student_portal');
  await conn.query('USE student_portal');
  console.log('✅ Database: Neo-Zenith Institute (student_portal) ready');

  // Create tables
  await conn.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('student','admin','professor') DEFAULT 'student',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS students (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      name VARCHAR(150) NOT NULL,
      course VARCHAR(100),
      year INT,
      section VARCHAR(20),
      email VARCHAR(150),
      phone VARCHAR(30),
      address TEXT,
      photo_url VARCHAR(255),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS grades (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      subject VARCHAR(100),
      grade DECIMAL(5,2),
      semester VARCHAR(30),
      school_year VARCHAR(20),
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS schedules (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      subject VARCHAR(100),
      time VARCHAR(50),
      day VARCHAR(20),
      room VARCHAR(50),
      instructor VARCHAR(150),
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS announcements (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      content TEXT,
      category VARCHAR(50) DEFAULT 'General',
      date DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      sender_id INT NOT NULL,
      receiver_id INT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users(id),
      FOREIGN KEY (receiver_id) REFERENCES users(id)
    );
  `);

  console.log('✅ Quantum Tables verified');

  // Clear existing data
  await conn.query('SET FOREIGN_KEY_CHECKS = 0');
  await conn.query('TRUNCATE TABLE messages');
  await conn.query('TRUNCATE TABLE announcements');
  await conn.query('TRUNCATE TABLE schedules');
  await conn.query('TRUNCATE TABLE grades');
  await conn.query('DELETE FROM students');
  await conn.query('DELETE FROM users');
  await conn.query('SET FOREIGN_KEY_CHECKS = 1');
  console.log('🧹 Purging redundant data cycles...');

  // Hash passwords
  const adminPass = await bcrypt.hash('admin123', 10);
  const profPass = await bcrypt.hash('faculty123', 10);

  // Users & Roles
  await conn.query(`
    INSERT INTO users (username, password, role) VALUES
    ('admin', ?, 'admin'),
    ('professor_vance', ?, 'professor'),
    ('professor_nova', ?, 'professor')
  `, [adminPass, profPass, profPass]);

  console.log('✅ Admin & Professors established');

  // Mass Seeding Logic (BSCS 1-4 Sections A & B)
  const premiumNames = [
    "Zion Apex", "Nova Zenith", "Atlas Prime", "Luna Stella",
    "Orion Frost", "Lyra Dawn", "Arlo Vance", "Ember Sol",
    "Kaelen Sky", "Seren Voss", "Juno Bolt", "Xylon Core",
    "Astra Vale", "Caelum Nix", "Rhea Pulse", "Finnian Ash"
  ];

  let nameIndex = 0;
  for (let year = 1; year <= 4; year++) {
    for (const section of ['A', 'B']) {
      for (let i = 1; i <= 2; i++) {
        const studentNo = `2024${year}${section}${i}`;
        const name = premiumNames[nameIndex % premiumNames.length];
        nameIndex++;

        const hashedPass = await bcrypt.hash(studentNo, 10);

        const [userResult] = await conn.query(`
          INSERT INTO users (username, password, role) VALUES (?, ?, 'student')
        `, [studentNo, hashedPass]);

        const userId = userResult.insertId;

        const [studentResult] = await conn.query(`
          INSERT INTO students (user_id, name, course, year, section, email, phone, address) VALUES
          (?, ?, 'BSCS', ?, ?, ?, '0917-ZEN-000', 'Neo-Zenith District 7')
        `, [userId, name, year, section, `${name.toLowerCase().replace(' ', '.')}@neo-zenith.edu`]);

        const studentId = studentResult.insertId;

        // Sample data for each
        await conn.query(`
          INSERT INTO grades (student_id, subject, grade, semester, school_year) VALUES
          (?, 'AI Systems & Neural Links', 1.25, '1st Semester', '2024-2025'),
          (?, 'Quantum Computing Fundamentals', 1.50, '1st Semester', '2024-2025')
        `, [studentId, studentId]);

        await conn.query(`
          INSERT INTO schedules (student_id, subject, time, day, room, instructor) VALUES
          (?, 'AI Systems', '08:00 - 10:00', 'Monday', 'Lab Omega', 'Prof. Vance'),
          (?, 'Quantum Logic', '13:00 - 15:00', 'Wednesday', 'Chamber Alpha', 'Prof. Nova')
        `, [studentId, studentId]);
      }
    }
  }

  console.log('👤 Mass Student body initialized: BSCS Years 1-4 (Sections A & B)');

  // Announcements
  await conn.query(`
    INSERT INTO announcements (title, content, category) VALUES
    ('Neural Link Synchronization Ceremony', 'All Year 1 students are required to attend the official sync ceremony at the Great Hall.', 'Events'),
    ('Quantum Database Maintenance', 'The student portal will undergo quantum stability checks this weekend.', 'General'),
    ('Annual Neo-Zenith Gala', 'Celebrating 50 years of academic excellence at the peak of innovation.', 'Events')
  `);
  console.log('✅ Institutional Announcements broadcasted');

  await conn.end();
  console.log('\n✨  CHCCI (Version 2.0.1) INITIALIZATION COMPLETE! ✨\n');
}

seed().catch(err => {
  console.error('\n❌ Initialization failed:', err.message);
  process.exit(1);
});

-- 1. Tables Creation (Siguraduhing nasa 'defaultdb' ka sa DBeaver)

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('student', 'admin', 'professor') DEFAULT 'student',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

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

CREATE TABLE IF NOT EXISTS grades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  subject VARCHAR(100),
  grade DECIMAL(5,2),
  semester VARCHAR(30),
  school_year VARCHAR(20),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

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

CREATE TABLE IF NOT EXISTS announcements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT,
  category VARCHAR(50) DEFAULT 'General',
  date DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Seed Data (Inayos ko ang passwords para maging 12345678 sa professors)

-- Admin (admin123)
INSERT IGNORE INTO users (id, username, password, role) VALUES
(1, 'admin', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Professors (12345678)
INSERT IGNORE INTO users (id, username, password, role) VALUES
(20, 'harold.gonzalez', '$2a$10$76YmP3FCHd9/q/n8tG.pbeZfP6QfP7n7m6g.Yf7n7m6g.Yf7n7m6g', 'professor'),
(21, 'romano.yumul', '$2a$10$76YmP3FCHd9/q/n8tG.pbeZfP6QfP7n7m6g.Yf7n7m6g.Yf7n7m6g', 'professor'),
(22, 'patrick.torres', '$2a$10$76YmP3FCHd9/q/n8tG.pbeZfP6QfP7n7m6g.Yf7n7m6g.Yf7n7m6g', 'professor'),
(23, 'jhonleo.simora', '$2a$10$76YmP3FCHd9/q/n8tG.pbeZfP6QfP7n7m6g.Yf7n7m6g.Yf7n7m6g', 'professor'),
(24, 'jeff.montalbo', '$2a$10$76YmP3FCHd9/q/n8tG.pbeZfP6QfP7n7m6g.Yf7n7m6g.Yf7n7m6g', 'professor'),
(25, 'ervin.pineda', '$2a$10$76YmP3FCHd9/q/n8tG.pbeZfP6QfP7n7m6g.Yf7n7m6g.Yf7n7m6g', 'professor'),
(26, 'lanie.capuno', '$2a$10$76YmP3FCHd9/q/n8tG.pbeZfP6QfP7n7m6g.Yf7n7m6g.Yf7n7m6g', 'professor');

-- Sample Student Profile (Juan)
INSERT IGNORE INTO users (id, username, password, role) VALUES
(2, 'juan.dela.cruz', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student');

INSERT IGNORE INTO students (id, user_id, name, course, year, section, email, address) VALUES
(1, 2, 'Juan Dela Cruz', 'BSCS', 3, 'A', 'juan@school.edu.ph', 'Concepcion, Tarlac');

-- Sample Schedule for Juan (ID 1)
INSERT IGNORE INTO schedules (student_id, subject, time, day, room, instructor) VALUES
(1, 'Operating System', '7:30 AM - 9:00 AM', 'Monday', 'Room 301', 'Prof. Harold Gonzalez'),
(1, 'Thesis Writing 1', '9:00 AM - 10:30 AM', 'Monday', 'Lab 201', 'Prof. Romano Yumul'),
(1, 'Elective 2', '1:00 PM - 2:30 PM', 'Tuesday', 'Room 302', 'Prof. Patrick Jason Torres'),
(1, 'Event Driven Programming', '2:30 PM - 4:00 PM', 'Wednesday', 'Lab 202', 'Prof. Jhon Leo Simora'),
(1, 'Software Engineering 2', '7:30 AM - 9:00 AM', 'Thursday', 'Room 303', 'Prof. Jeff Montalbo'),
(1, 'Human Computer Interaction', '7:30 AM - 9:00 AM', 'Friday', 'Room 301', 'Prof. Ervin Pineda'),
(1, 'Quantitative Methods', '9:00 AM - 10:30 AM', 'Friday', 'Room 301', 'Prof. Lanie Capuno');

-- Announcements
INSERT IGNORE INTO announcements (title, content, category, date) VALUES
('Final Examination Schedule - 2nd Semester', 'The final examinations for AY 2025-2026 are scheduled for May 18-22, 2026.', 'Examination', '2026-04-15 08:00:00'),
('Capstone Project Defense Phase 2', 'Final defense for AI-assisted Aquaponics projects will be posted soon.', 'Events', '2026-04-10 14:00:00');
-- Student Portal Database Schema
CREATE DATABASE IF NOT EXISTS student_portal;
USE student_portal;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('student', 'admin', 'professor') DEFAULT 'student',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Support Messages table
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

-- Students table
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

-- Grades table
CREATE TABLE IF NOT EXISTS grades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  subject VARCHAR(100),
  grade DECIMAL(5,2),
  semester VARCHAR(30),
  school_year VARCHAR(20),
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Schedules table
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

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT,
  category VARCHAR(50) DEFAULT 'General',
  date DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed: Default admin user (password: admin123)
INSERT IGNORE INTO users (username, password, role) VALUES
('admin', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Seed: Sample student user (password: student123)
INSERT IGNORE INTO users (username, password, role) VALUES
('juan.dela.cruz', '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'student');

-- Seed: Sample student profile
INSERT IGNORE INTO students (user_id, name, course, year, section, email, phone, address) VALUES
(2, 'Juan Dela Cruz', 'Bachelor of Science in Information Technology', 3, 'A', 'juan@school.edu', '09123456789', 'Manila, Philippines');

-- Seed: Sample grades
INSERT IGNORE INTO grades (student_id, subject, grade, semester, school_year) VALUES
(1, 'Data Structures and Algorithms', 1.25, '1st Semester', '2024-2025'),
(1, 'Web Development', 1.50, '1st Semester', '2024-2025'),
(1, 'Database Management', 1.75, '1st Semester', '2024-2025'),
(1, 'Object-Oriented Programming', 1.25, '1st Semester', '2024-2025'),
(1, 'Computer Networks', 2.00, '1st Semester', '2024-2025');

-- Seed: Sample schedule
INSERT IGNORE INTO schedules (student_id, subject, time, day, room, instructor) VALUES
(1, 'Data Structures and Algorithms', '7:30 AM - 9:00 AM', 'Monday', 'Room 301', 'Prof. Santos'),
(1, 'Web Development', '9:00 AM - 10:30 AM', 'Monday', 'Lab 201', 'Prof. Reyes'),
(1, 'Database Management', '1:00 PM - 2:30 PM', 'Tuesday', 'Room 302', 'Prof. Garcia'),
(1, 'Object-Oriented Programming', '2:30 PM - 4:00 PM', 'Wednesday', 'Lab 202', 'Prof. Cruz'),
(1, 'Computer Networks', '7:30 AM - 9:00 AM', 'Thursday', 'Room 303', 'Prof. Lim'),
(1, 'Data Structures and Algorithms', '7:30 AM - 9:00 AM', 'Friday', 'Room 301', 'Prof. Santos');

-- Seed: Sample announcements
INSERT IGNORE INTO announcements (title, content, category, date) VALUES
('Enrollment for 2nd Semester Now Open', 'Dear Students, enrollment for the 2nd semester of AY 2024-2025 is now open. Please visit the registrar from 8AM-5PM Monday to Friday.', 'Academic', '2024-11-15 08:00:00'),
('Mid-Term Examination Schedule Released', 'The mid-term examination schedule has been released. Please check your respective departments for the detailed schedule.', 'Examination', '2024-10-01 09:00:00'),
('Scholarship Application Deadline', 'All scholarship applicants are reminded that the deadline for submission is on November 30, 2024. Submit all requirements to the scholarship office.', 'Financial', '2024-11-01 10:00:00'),
('Campus Clean-Up Drive', 'Join us for our quarterly campus clean-up drive this Saturday, November 16, 2024, starting at 7:00 AM. All students are encouraged to participate.', 'Events', '2024-11-10 14:00:00');

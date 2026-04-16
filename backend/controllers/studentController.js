const db = require('../config/db');
const bcrypt = require('bcryptjs');

// GET /api/student/dashboard - summary for logged-in student
const getDashboard = async (req, res) => {
  try {
    const studentId = req.user.studentId;
    if (!studentId && req.user.role !== 'admin') {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    if (req.user.role === 'admin') {
      const [students] = await db.query('SELECT COUNT(*) as count FROM students');
      const [allGrades] = await db.query('SELECT AVG(grade) as avgGrade FROM grades');
      const [allSchedules] = await db.query('SELECT COUNT(*) as count FROM schedules');
      const [announcementsList] = await db.query('SELECT * FROM announcements ORDER BY date DESC LIMIT 3');

      return res.json({
        success: true,
        data: {
          student: { name: req.user.name || 'System Administrator', course: 'System Global', year: 'N/A', section: 'Admin' },
          gradesSummary: { count: students[0].count, gpa: parseFloat(allGrades[0].avgGrade || 0).toFixed(2) },
          scheduleCount: allSchedules[0].count,
          recentAnnouncements: announcementsList
        }
      });
    }

    const [student] = await db.query('SELECT * FROM students WHERE id = ?', [studentId]);
    const [grades] = await db.query('SELECT * FROM grades WHERE student_id = ?', [studentId]);
    const [schedules] = await db.query('SELECT * FROM schedules WHERE student_id = ?', [studentId]);
    const [announcements] = await db.query('SELECT * FROM announcements ORDER BY date DESC LIMIT 3');

    const gpa = grades.length > 0
      ? (grades.reduce((sum, g) => sum + parseFloat(g.grade), 0) / grades.length).toFixed(2)
      : null;

    res.json({
      success: true,
      data: {
        student: student[0],
        gradesSummary: { count: grades.length, gpa },
        scheduleCount: schedules.length,
        recentAnnouncements: announcements
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/profile/:id
const getProfile = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT s.*, u.username, u.role FROM students s JOIN users u ON s.user_id = u.id WHERE s.id = ?',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Student not found.' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/students - all students (admin)
const getAllStudents = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT s.*, u.username FROM students s LEFT JOIN users u ON s.user_id = u.id ORDER BY s.id DESC');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// POST /api/students (admin)
const createStudent = async (req, res) => {
  const { username, password, name, course, year, section, email, phone, address } = req.body;
  if (!username || !password || !name) {
    return res.status(400).json({ success: false, message: 'Username, password, and name are required.' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const [userResult] = await db.query(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username, hashedPassword, 'student']
    );
    const userId = userResult.insertId;
    const [studentResult] = await db.query(
      'INSERT INTO students (user_id, name, course, year, section, email, phone, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, name, course, year, section, email, phone, address]
    );
    res.status(201).json({ success: true, message: 'Student created.', data: { id: studentResult.insertId } });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, message: 'Username already exists.' });
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// PUT /api/students/:id (admin)
const updateStudent = async (req, res) => {
  const { name, course, year, section, email, phone, address } = req.body;
  try {
    await db.query(
      'UPDATE students SET name = ?, course = ?, year = ?, section = ?, email = ?, phone = ?, address = ? WHERE id = ?',
      [name, course, year, section, email, phone, address, req.params.id]
    );
    res.json({ success: true, message: 'Student updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// DELETE /api/students/:id (admin)
const deleteStudent = async (req, res) => {
  try {
    const [student] = await db.query('SELECT user_id FROM students WHERE id = ?', [req.params.id]);
    if (student.length === 0) return res.status(404).json({ success: false, message: 'Student not found.' });

    // Burahin muna ang records sa related tables para sa specific student na ito
    await db.query('DELETE FROM grades WHERE student_id = ?', [req.params.id]);
    await db.query('DELETE FROM schedules WHERE student_id = ?', [req.params.id]);

    await db.query('DELETE FROM students WHERE id = ?', [req.params.id]);
    if (student[0].user_id) await db.query('DELETE FROM users WHERE id = ?', [student[0].user_id]);

    res.json({ success: true, message: 'Student deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// POST /api/students/bulk (admin)
const bulkCreateStudents = async (req, res) => {
  const { students } = req.body;
  if (!students || !Array.isArray(students)) {
    return res.status(400).json({ success: false, message: 'Valid students array required.' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const results = [];

    for (const s of students) {
      const studentNumber = s.studentNumber || s['Student Number'] || s['student_id'] || s['Student'];
      const name = s.name || s['Full Name'] || s['fullname'];
      const course = s.course || s['Course'];
      const year = s.year || s['Year'];
      const section = s.section || s['Section'];
      const email = s.email || s['Email'];
      const phone = s.phone || s['Phone'];
      const address = s.address || s['Address'] || s['Adress'];

      if (!studentNumber || !name) continue;

      const hashedPassword = await bcrypt.hash(studentNumber.toString(), 10);
      const [userResult] = await conn.query(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        [studentNumber.toString(), hashedPassword, 'student']
      );
      const userId = userResult.insertId;

      await conn.query(
        'INSERT INTO students (user_id, name, course, year, section, email, phone, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [userId, name, course, year, section, email, phone, address]
      );
      results.push(studentNumber);
    }

    await conn.commit();
    res.json({ success: true, message: `Successfully imported ${results.length} students.`, count: results.length });
  } catch (err) {
    await conn.rollback();
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Duplicate entry detected: One or more student numbers are already registered.' });
    }
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error during bulk import.' });
  } finally {
    conn.release();
  }
};

// DELETE /api/students/all (admin)
const deleteAllStudents = async (req, res) => {
  try {
    // 1. Burahin ang messages na involved ang mga students
    // Ginagamit natin ang subquery para mahanap lahat ng users na 'student' ang role
    await db.query(`
      DELETE FROM messages 
      WHERE sender_id IN (SELECT id FROM users WHERE role = 'student')
      OR receiver_id IN (SELECT id FROM users WHERE role = 'student')
    `);

    // 2. Burahin ang data sa iba pang related tables
    await db.query('DELETE FROM grades');
    await db.query('DELETE FROM schedules');

    // 3. Burahin ang lahat ng students
    await db.query('DELETE FROM students');

    // 4. Burahin ang lahat ng users na ang role ay 'student'
    await db.query("DELETE FROM users WHERE role = 'student'");

    res.status(200).json({
      success: true,
      message: "Student registry, messages, and associated records have been cleared."
    });
  } catch (error) {
    console.error("Delete All Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear records: " + error.message
    });
  }
};

// Bulk Upload for Grades
const bulkCreateGrades = async (req, res) => {
  const { grades } = req.body; // Inaasahan ang array ng { student_id, subject, grade, semester, school_year }
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    for (const g of grades) {
      await conn.query(
        'INSERT INTO grades (student_id, subject, grade, semester, school_year) VALUES (?, ?, ?, ?, ?)',
        [g.student_id, g.subject, g.grade, g.semester, g.school_year]
      );
    }
    await conn.commit();
    res.json({ success: true, message: `Successfully imported ${grades.length} grades.` });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ success: false, message: 'Error importing grades: ' + err.message });
  } finally {
    conn.release();
  }
};

// Bulk Upload for Schedules (Auto-generate 3 per day)
const bulkCreateSchedules = async (req, res) => {
  const { studentIds, subjects } = req.body;
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const times = ['7:30 - 9:30', '10:00 - 12:00', '1:00 - 3:00'];

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    let count = 0;

    for (const id of studentIds) {
      for (const day of days) {
        // Mag-assign ng 3 subjects bawat araw
        for (let i = 0; i < 3; i++) {
          const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
          await conn.query(
            'INSERT INTO schedules (student_id, subject, day, time, room, instructor) VALUES (?, ?, ?, ?, ?, ?)',
            [id, randomSubject, day, times[i], `Room ${Math.floor(Math.random() * 500)}`, 'Staff']
          );
          count++;
        }
      }
    }
    await conn.commit();
    res.json({ success: true, message: `Generated ${count} schedule entries for Monday-Saturday.` });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ success: false, message: 'Error generating schedules.' });
  } finally {
    conn.release();
  }
};

module.exports = {
  getDashboard,
  getProfile,
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  bulkCreateStudents,
  deleteAllStudents
};
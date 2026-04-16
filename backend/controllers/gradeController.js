const db = require('../config/db');

// GET /api/grades/:student_id
const getGrades = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM grades WHERE student_id = ? ORDER BY subject', [req.params.student_id]);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// POST /api/grades (admin)
const createGrade = async (req, res) => {
  const { student_id, subject, grade, semester, school_year } = req.body;
  if (!student_id || !subject || grade === undefined) {
    return res.status(400).json({ success: false, message: 'student_id, subject, and grade are required.' });
  }
  try {
    const [result] = await db.query(
      'INSERT INTO grades (student_id, subject, grade, semester, school_year) VALUES (?, ?, ?, ?, ?)',
      [student_id, subject, grade, semester, school_year]
    );
    res.status(201).json({ success: true, message: 'Grade added.', data: { id: result.insertId } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// PUT /api/grades/:id (admin)
const updateGrade = async (req, res) => {
  const { subject, grade, semester, school_year } = req.body;
  try {
    await db.query(
      'UPDATE grades SET subject = ?, grade = ?, semester = ?, school_year = ? WHERE id = ?',
      [subject, grade, semester, school_year, req.params.id]
    );
    res.json({ success: true, message: 'Grade updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// DELETE /api/grades/:id (admin)
const deleteGrade = async (req, res) => {
  try {
    await db.query('DELETE FROM grades WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Grade deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getGrades, createGrade, updateGrade, deleteGrade };

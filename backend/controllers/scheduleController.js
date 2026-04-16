const db = require('../config/db');

// GET /api/schedule/:student_id
const getSchedule = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM schedules WHERE student_id = ? ORDER BY FIELD(day,"Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"), time',
      [req.params.student_id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// POST /api/schedule (admin)
const createSchedule = async (req, res) => {
  const { student_id, subject, time, day, room, instructor } = req.body;
  if (!student_id || !subject || !day) {
    return res.status(400).json({ success: false, message: 'student_id, subject, and day are required.' });
  }
  try {
    const [result] = await db.query(
      'INSERT INTO schedules (student_id, subject, time, day, room, instructor) VALUES (?, ?, ?, ?, ?, ?)',
      [student_id, subject, time, day, room, instructor]
    );
    res.status(201).json({ success: true, message: 'Schedule added.', data: { id: result.insertId } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// PUT /api/schedule/:id (admin)
const updateSchedule = async (req, res) => {
  const { subject, time, day, room, instructor } = req.body;
  try {
    await db.query(
      'UPDATE schedules SET subject = ?, time = ?, day = ?, room = ?, instructor = ? WHERE id = ?',
      [subject, time, day, room, instructor, req.params.id]
    );
    res.json({ success: true, message: 'Schedule updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// DELETE /api/schedule/:id (admin)
const deleteSchedule = async (req, res) => {
  try {
    await db.query('DELETE FROM schedules WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Schedule deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getSchedule, createSchedule, updateSchedule, deleteSchedule };

const db = require('../config/db');

// GET /api/announcements
const getAnnouncements = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM announcements ORDER BY date DESC');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// POST /api/announcements (admin)
const createAnnouncement = async (req, res) => {
  const { title, content, category } = req.body;
  if (!title || !content) {
    return res.status(400).json({ success: false, message: 'Title and content are required.' });
  }
  try {
    const [result] = await db.query(
      'INSERT INTO announcements (title, content, category) VALUES (?, ?, ?)',
      [title, content, category || 'General']
    );
    res.status(201).json({ success: true, message: 'Announcement created.', data: { id: result.insertId } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// PUT /api/announcements/:id (admin)
const updateAnnouncement = async (req, res) => {
  const { title, content, category } = req.body;
  try {
    await db.query(
      'UPDATE announcements SET title = ?, content = ?, category = ? WHERE id = ?',
      [title, content, category, req.params.id]
    );
    res.json({ success: true, message: 'Announcement updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// DELETE /api/announcements/:id (admin)
const deleteAnnouncement = async (req, res) => {
  try {
    await db.query('DELETE FROM announcements WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Announcement deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement };

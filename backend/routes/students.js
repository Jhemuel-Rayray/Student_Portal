const express = require('express');
const router = express.Router();
const { auth, adminOnly, facultyOnly } = require('../middleware/auth');
const {
  getDashboard,
  getProfile,
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  bulkCreateStudents,

  deleteAllStudents // Idagdag ang bagong function dito
} = require('../controllers/studentController');

router.get('/dashboard', auth, getDashboard);
router.get('/profile/:id', auth, getProfile);
router.get('/', auth, facultyOnly, getAllStudents);

// Bulk Operations
router.post('/bulk', auth, adminOnly, bulkCreateStudents);
router.delete('/all', auth, adminOnly, deleteAllStudents);
router.post('/bulk-grades', auth, adminOnly, bulkCreateGrades);
router.post('/bulk-schedules', auth, adminOnly, bulkCreateSchedules);// Route para sa Delete All

// Individual Operations
router.post('/', auth, adminOnly, createStudent);
router.put('/:id', auth, facultyOnly, updateStudent);
router.delete('/:id', auth, adminOnly, deleteStudent);

module.exports = router;
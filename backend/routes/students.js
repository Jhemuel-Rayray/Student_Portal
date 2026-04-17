const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController'); // Check mo kung tama ang path
const verifyToken = require('../middleware/auth');
const {
  getDashboard,
  getProfile,
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  bulkCreateStudents,
  bulkCreateGrades,
  bulkCreateSchedules, // Siguraduhing nandito rin ito!
  deleteAllStudents
} = require('../controllers/studentController');

router.get('/dashboard', verifyToken, studentController.getDashboardData);
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
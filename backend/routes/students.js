const express = require('express');
const router = express.Router();

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
  bulkCreateSchedules,
  deleteAllStudents
} = require('../controllers/studentController');

// Routes
router.get('/dashboard', verifyToken, getDashboard);
router.get('/profile/:id', verifyToken, getProfile);
router.get('/', verifyToken, getAllStudents);

// Bulk
router.post('/bulk', verifyToken, bulkCreateStudents);
router.delete('/all', verifyToken, deleteAllStudents);
router.post('/bulk-grades', verifyToken, bulkCreateGrades);
router.post('/bulk-schedules', verifyToken, bulkCreateSchedules);

// CRUD
router.post('/', verifyToken, createStudent);
router.put('/:id', verifyToken, updateStudent);
router.delete('/:id', verifyToken, deleteStudent);

module.exports = router;
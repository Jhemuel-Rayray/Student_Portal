const express = require('express');
const router = express.Router();

// 1. Siguraduhin na ang auth middleware path ay tama
const auth = require('../middleware/auth');

// 2. TANGGALIN ang 's' sa gradesController para maging 'gradeController'
// Dahil 'gradeController.js' ang filename mo
const { getGrades, createGrade, updateGrade, deleteGrade } = require('../controllers/gradeController');

router.get('/:student_id', auth, getGrades);
router.post('/', auth, createGrade);
router.put('/:id', auth, updateGrade);
router.delete('/:id', auth, deleteGrade);

module.exports = router;
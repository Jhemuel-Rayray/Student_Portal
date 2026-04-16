const express = require('express');
const router = express.Router();
const { auth, adminOnly, facultyOnly } = require('../middleware/auth');
const { getGrades, createGrade, updateGrade, deleteGrade } = require('../controllers/gradeController');

router.get('/:student_id', auth, getGrades);
router.post('/', auth, facultyOnly, createGrade);
router.put('/:id', auth, facultyOnly, updateGrade);
router.delete('/:id', auth, facultyOnly, deleteGrade);

module.exports = router;

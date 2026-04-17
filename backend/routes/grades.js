const express = require('express');
const router = express.Router();

// TAMA: Import as a single function dahil 'module.exports = verifyToken' ang nasa auth.js
const auth = require('../middleware/auth');

// TAMA: Siguraduhin na 'gradesController' (may S) ang filename
const { getGrades, createGrade, updateGrade, deleteGrade } = require('../controllers/gradesController');

// Routes
router.get('/:student_id', auth, getGrades);
router.post('/', auth, createGrade);
router.put('/:id', auth, updateGrade);
router.delete('/:id', auth, deleteGrade);

module.exports = router;
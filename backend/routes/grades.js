const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // TAMA: No curly braces
const gradeController = require('../controllers/gradeController');

router.get('/:student_id', auth, gradeController.getGrades);
router.post('/', auth, gradeController.createGrade);
router.put('/:id', auth, gradeController.updateGrade);
router.delete('/:id', auth, gradeController.deleteGrade);

module.exports = router;
const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const { getSchedule, createSchedule, updateSchedule, deleteSchedule } = require('../controllers/scheduleController');

router.get('/:student_id', auth, getSchedule);
router.post('/', auth, adminOnly, createSchedule);
router.put('/:id', auth, adminOnly, updateSchedule);
router.delete('/:id', auth, adminOnly, deleteSchedule);

module.exports = router;

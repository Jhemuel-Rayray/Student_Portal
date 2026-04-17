const express = require('express');
const router = express.Router();

// TAMA: Dahil function lang ang in-export sa auth.js
const auth = require('../middleware/auth');

// TAMA: Siguraduhin na ang filename ay 'scheduleController.js'
const { getSchedule, createSchedule, updateSchedule, deleteSchedule } = require('../controllers/scheduleController');

// Inalis muna natin ang adminOnly dahil wala pa itong export sa auth.js mo
router.get('/:student_id', auth, getSchedule);
router.post('/', auth, createSchedule);
router.put('/:id', auth, updateSchedule);
router.delete('/:id', auth, deleteSchedule);

module.exports = router;
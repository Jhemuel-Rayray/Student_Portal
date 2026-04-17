const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // TAMA: No curly braces
const scheduleController = require('../controllers/scheduleController');

router.get('/:student_id', auth, scheduleController.getSchedule);
router.post('/', auth, scheduleController.createSchedule);
router.put('/:id', auth, scheduleController.updateSchedule);
router.delete('/:id', auth, scheduleController.deleteSchedule);

module.exports = router;
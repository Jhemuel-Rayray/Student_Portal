const db = require('../config/db');

const getMotivation = async (req, res) => {
  try {
    const studentId = req.user.studentId;
    if (!studentId) return res.status(404).json({ success: false, message: 'Student ID not found in token.' });

    const [grades] = await db.query('SELECT grade FROM grades WHERE student_id = ?', [studentId]);

    // Simple rule-based AI simulation
    let message = "";
    if (grades.length === 0) {
      message = "Welcome to CHCCI Institute! Your academic journey begins now. Stay curious and stay bold.";
    } else {
      const avg = grades.reduce((sum, g) => sum + parseFloat(g.grade), 0) / grades.length;

      if (avg <= 1.5) {
        message = "Elite performance detected. You are mastering the curriculum with precision. Continue your ascent to excellence!";
      } else if (avg <= 2.25) {
        message = "Consistent progress. You are navigating the challenges well. Keep pushing your boundaries to reach the pinnacle.";
      } else if (avg <= 3.0) {
        message = "Steady growth. Every session is an opportunity to refine your craft. Focus on your core subjects for a breakthrough.";
      } else {
        message = "Resilience is key. Use your current results as fuel for a massive comeback. We believe in your untapped potential.";
      }
    }

    res.json({ success: true, message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'AI Link Failure.' });
  }
};

module.exports = { getMotivation };

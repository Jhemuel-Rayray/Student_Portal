const db = require('../config/db');

// POST /api/chat/send
const sendMessage = async (req, res) => {
  const { receiverId, content } = req.body;
  const senderId = req.user.id;
  let targetId = receiverId;

  if (!content) return res.status(400).json({ success: false, message: 'Message content is required.' });

  try {
    // If targetId is 'admin', dynamically find the admin user's ID in the database.
    if (!targetId || targetId === 'admin') {
      const [admins] = await db.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
      if (admins.length > 0) targetId = admins[0].id;
      else return res.status(404).json({ success: false, message: 'Support is currently disconnected.' });
    }

    await db.query(
      'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)',
      [senderId, targetId, content]
    );

    // AI Connection logic using a free API (Advice Slip)
    if (receiverId === 'admin' || !receiverId) {
      setTimeout(async () => {
        try {
           const response = await fetch('https://api.adviceslip.com/advice');
           const data = await response.json();
           const aiReply = "Neo-Zenith AI Insight: " + data.slip.advice;

           await db.query(
             'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)',
             [targetId, senderId, aiReply]
           );
        } catch (e) {
           console.error("AI API failed to fetch:", e);
           // Fallback if the API fails
           await db.query(
             'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)',
             [targetId, senderId, "Neo-Zenith AI is currently recalibrating its neural network. Please check back later."]
           );
        }
      }, 1000); // Small 1-sec delay before sending AI message
    }

    res.status(201).json({ success: true, message: 'Transmission successful.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Signal failure.' });
  }
};

// GET /api/chat/:peerId
const getMessages = async (req, res) => {
  const myId = req.user.id;
  let peerId = req.params.peerId;

  try {
    if (peerId === 'admin') {
      const [admins] = await db.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
      if (admins.length > 0) peerId = admins[0].id;
      else return res.status(404).json({ success: false, message: 'Admin not found.' });
    }

    const [rows] = await db.query(
      `SELECT * FROM messages 
       WHERE (sender_id = ? AND receiver_id = ?) 
          OR (sender_id = ? AND receiver_id = ?) 
       ORDER BY created_at ASC`,
      [myId, peerId, peerId, myId]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Data retrieval error.' });
  }
};

// GET /api/chat/conversations (Faculty Only)
const getConversations = async (req, res) => {
  try {
    // List unique students who have exchanged messages
    const [rows] = await db.query(
      `SELECT DISTINCT u.id, u.username, s.name, s.course, s.year, s.section
       FROM users u
       JOIN messages m ON (u.id = m.sender_id OR u.id = m.receiver_id)
       JOIN students s ON u.id = s.user_id
       WHERE u.role = 'student'
       ORDER BY m.created_at DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Channel error.' });
  }
};

module.exports = { sendMessage, getMessages, getConversations };

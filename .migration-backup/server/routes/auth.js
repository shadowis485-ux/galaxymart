const express = require('express');
const { authMiddleware, generateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'Password required' });

    const correctPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (password !== correctPassword) {
      return res.status(401).json({ error: 'Wrong admin password' });
    }

    const token = generateToken({ role: 'admin', email: process.env.ADMIN_EMAIL || 'admin' });
    res.json({ token, email: process.env.ADMIN_EMAIL || 'admin' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', authMiddleware, (req, res) => {
  res.json({ admin: req.admin });
});

module.exports = router;

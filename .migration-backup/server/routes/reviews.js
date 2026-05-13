const express = require('express');
const { run, get, all } = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const reviews = await all(`
      SELECT r.*, p.name as product_name
      FROM reviews r LEFT JOIN products p ON r.product_id = p.id
      WHERE r.is_approved = 1
      ORDER BY r.created_at DESC
    `);
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { customer_name, rating, comment, product_id } = req.body;
    if (!customer_name || !rating) return res.status(400).json({ error: 'Name and rating required' });
    if (rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be 1-5' });
    const result = await run(
      'INSERT INTO reviews (customer_name, rating, comment, product_id) VALUES (?, ?, ?, ?)',
      [customer_name, parseInt(rating), comment, product_id || null]
    );
    const review = await get('SELECT * FROM reviews WHERE id = ?', [result.id]);
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await run('DELETE FROM reviews WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

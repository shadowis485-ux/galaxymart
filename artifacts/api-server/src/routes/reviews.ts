import { Router } from 'express';
import { run, get, all } from '../db';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', (req, res) => {
  try {
    const reviews = all(`
      SELECT r.*, p.name as product_name
      FROM reviews r LEFT JOIN products p ON r.product_id = p.id
      WHERE r.is_approved = 1
      ORDER BY r.created_at DESC
    `);
    res.json(reviews);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/', (req, res) => {
  try {
    const { customer_name, rating, comment, product_id } = req.body;
    if (!customer_name || !rating) return res.status(400).json({ error: 'Name and rating required' });
    if (rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be 1-5' });
    const result = run(
      'INSERT INTO reviews (customer_name, rating, comment, product_id) VALUES (?, ?, ?, ?)',
      [customer_name, parseInt(rating), comment, product_id || null]
    );
    const review = get('SELECT * FROM reviews WHERE id = ?', [result.lastInsertRowid]);
    res.status(201).json(review);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authMiddleware, (req, res) => {
  try {
    run('DELETE FROM reviews WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;

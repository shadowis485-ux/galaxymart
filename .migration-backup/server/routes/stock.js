const express = require('express');
const { run, get, all } = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/add', authMiddleware, async (req, res) => {
  try {
    const { product_id, items } = req.body;
    if (!product_id || !items) return res.status(400).json({ error: 'product_id and items required' });

    const lines = items.split('\n').map(l => l.trim()).filter(Boolean);
    if (!lines.length) return res.status(400).json({ error: 'No valid items' });

    for (const content of lines) {
      await run('INSERT INTO digital_stock (product_id, content) VALUES (?, ?)', [product_id, content]);
    }

    const count = await get(
      'SELECT COUNT(*) as count FROM digital_stock WHERE product_id = ? AND is_delivered = 0',
      [product_id]
    );
    await run('UPDATE products SET stock_count = ? WHERE id = ?', [count.count, product_id]);

    res.json({ success: true, added: lines.length, total_stock: count.count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:productId', authMiddleware, async (req, res) => {
  try {
    const items = await all(
      'SELECT * FROM digital_stock WHERE product_id = ? ORDER BY created_at DESC',
      [req.params.productId]
    );
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const item = await get('SELECT * FROM digital_stock WHERE id = ?', [req.params.id]);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    if (item.is_delivered) return res.status(400).json({ error: 'Cannot delete delivered item' });
    await run('DELETE FROM digital_stock WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

import { Router } from 'express';
import { run, get, all } from '../db';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', (req, res) => {
  try {
    const categories = all(`
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id AND p.is_active = 1
      GROUP BY c.id ORDER BY c.name ASC
    `);
    res.json(categories);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/', authMiddleware, (req, res) => {
  try {
    const { name, icon } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const result = run('INSERT INTO categories (name, slug, icon) VALUES (?, ?, ?)', [name, slug, icon || '📦']);
    const cat = get('SELECT * FROM categories WHERE id = ?', [result.lastInsertRowid]);
    res.status(201).json(cat);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authMiddleware, (req, res) => {
  try {
    run('UPDATE products SET category_id = NULL WHERE category_id = ?', [req.params.id]);
    run('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;

const express = require('express');
const { run, get, all } = require('../db');
const { authMiddleware } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

const uploadDir = path.join(__dirname, '../../client/public/uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `product_${Date.now()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/', async (req, res) => {
  try {
    const { category, search, featured } = req.query;
    let sql = `
      SELECT p.*, c.name as category_name, c.slug as category_slug,
        (SELECT COUNT(*) FROM digital_stock WHERE product_id = p.id AND is_delivered = 0) as available_stock
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1
    `;
    const params = [];
    if (category && category !== 'all') {
      sql += ` AND c.slug = ?`;
      params.push(category);
    }
    if (search) {
      sql += ` AND (p.name LIKE ? OR p.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }
    if (featured === 'true') {
      sql += ` AND p.featured = 1`;
    }
    sql += ` ORDER BY p.featured DESC, p.created_at DESC`;
    const products = await all(sql, params);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const totalProducts = await get('SELECT COUNT(*) as count FROM products WHERE is_active = 1');
    const totalOrders = await get("SELECT COUNT(*) as count FROM orders WHERE payment_status = 'confirmed'");
    const totalRevenue = await get("SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE payment_status = 'confirmed'");
    const avgRating = await get('SELECT AVG(rating) as avg FROM reviews WHERE is_approved = 1');
    res.json({
      products: totalProducts.count,
      orders: totalOrders.count,
      revenue: totalRevenue.total,
      rating: avgRating.avg ? avgRating.avg.toFixed(1) : '5.0',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await get(`
      SELECT p.*, c.name as category_name,
        (SELECT COUNT(*) FROM digital_stock WHERE product_id = p.id AND is_delivered = 0) as available_stock
      FROM products p LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ? AND p.is_active = 1
    `, [req.params.id]);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { name, description, bullet_points, price, category_id, stock_count, featured, image_url: imageUrlText } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : (imageUrlText || null);
    const result = await run(
      'INSERT INTO products (name, description, bullet_points, price, category_id, image_url, stock_count, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, description, bullet_points || null, price ? parseFloat(price) : null, category_id || null, imageUrl, parseInt(stock_count) || 0, featured ? 1 : 0]
    );
    const product = await get('SELECT * FROM products WHERE id = ?', [result.id]);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { name, description, bullet_points, price, category_id, stock_count, featured, is_active, image_url: imageUrlText } = req.body;
    const existing = await get('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Product not found' });
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : (imageUrlText !== undefined ? imageUrlText : existing.image_url);
    await run(
      'UPDATE products SET name=?, description=?, bullet_points=?, price=?, category_id=?, image_url=?, stock_count=?, featured=?, is_active=?, updated_at=CURRENT_TIMESTAMP WHERE id=?',
      [
        name || existing.name,
        description !== undefined ? description : existing.description,
        bullet_points !== undefined ? bullet_points : existing.bullet_points,
        price !== undefined && price !== '' ? parseFloat(price) : existing.price,
        category_id !== undefined ? (category_id || null) : existing.category_id,
        imageUrl,
        stock_count !== undefined ? parseInt(stock_count) : existing.stock_count,
        featured !== undefined ? (featured ? 1 : 0) : existing.featured,
        is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active,
        req.params.id
      ]
    );
    const product = await get('SELECT * FROM products WHERE id = ?', [req.params.id]);
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Set price only
router.patch('/:id/price', authMiddleware, async (req, res) => {
  try {
    const { price } = req.body;
    const existing = await get('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Product not found' });
    const newPrice = price !== undefined && price !== '' ? parseFloat(price) : null;
    await run('UPDATE products SET price=?, updated_at=CURRENT_TIMESTAMP WHERE id=?', [newPrice, req.params.id]);
    const product = await get('SELECT * FROM products WHERE id = ?', [req.params.id]);
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Permanently delete product
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { permanent } = req.query;
    if (permanent === 'true') {
      await run('DELETE FROM digital_stock WHERE product_id = ?', [req.params.id]);
      await run('DELETE FROM products WHERE id = ?', [req.params.id]);
    } else {
      await run('UPDATE products SET is_active = 0 WHERE id = ?', [req.params.id]);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

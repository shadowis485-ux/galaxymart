import { Router } from 'express';
import { run, get, all } from '../db';
import { authMiddleware } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `product_${Date.now()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/stats', (req, res) => {
  try {
    const totalProducts = get('SELECT COUNT(*) as count FROM products WHERE is_active = 1');
    const totalOrders   = get("SELECT COUNT(*) as count FROM orders WHERE payment_status = 'confirmed'");
    const totalRevenue  = get("SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE payment_status = 'confirmed'");
    const avgRating     = get('SELECT AVG(rating) as avg FROM reviews WHERE is_approved = 1');
    res.json({
      products: totalProducts.count,
      orders: totalOrders.count,
      revenue: totalRevenue.total,
      rating: avgRating?.avg ? avgRating.avg.toFixed(1) : '5.0',
    });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get('/', (req, res) => {
  try {
    const { category, search, featured } = req.query as any;
    let sql = `
      SELECT p.*, c.name as category_name, c.slug as category_slug,
        (SELECT COUNT(*) FROM digital_stock WHERE product_id = p.id AND is_delivered = 0) as available_stock
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1
    `;
    const params: any[] = [];
    if (category && category !== 'all') { sql += ` AND c.slug = ?`; params.push(category); }
    if (search) { sql += ` AND (p.name LIKE ? OR p.description LIKE ?)`; params.push(`%${search}%`, `%${search}%`); }
    if (featured === 'true') sql += ` AND p.featured = 1`;
    sql += ` ORDER BY p.featured DESC, p.created_at DESC`;
    res.json(all(sql, params));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', (req, res) => {
  try {
    const product = get(`
      SELECT p.*, c.name as category_name,
        (SELECT COUNT(*) FROM digital_stock WHERE product_id = p.id AND is_delivered = 0) as available_stock
      FROM products p LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ? AND p.is_active = 1
    `, [req.params.id]);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/', authMiddleware, upload.single('image'), (req, res) => {
  try {
    const { name, description, bullet_points, price, category_id, stock_count, featured, image_url: imageUrlText } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    const imageUrl = (req as any).file ? `/uploads/${(req as any).file.filename}` : (imageUrlText || null);
    const result = run(
      'INSERT INTO products (name, description, bullet_points, price, category_id, image_url, stock_count, featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, description, bullet_points || null, price ? parseFloat(price) : null, category_id || null, imageUrl, parseInt(stock_count) || 0, featured ? 1 : 0]
    );
    res.status(201).json(get('SELECT * FROM products WHERE id = ?', [result.lastInsertRowid]));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authMiddleware, upload.single('image'), (req, res) => {
  try {
    const { name, description, bullet_points, price, category_id, stock_count, featured, is_active, image_url: imageUrlText } = req.body;
    const existing = get('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!existing) return res.status(404).json({ error: 'Product not found' });
    const imageUrl = (req as any).file ? `/uploads/${(req as any).file.filename}` : (imageUrlText !== undefined ? imageUrlText : existing.image_url);
    run(
      'UPDATE products SET name=?, description=?, bullet_points=?, price=?, category_id=?, image_url=?, stock_count=?, featured=?, is_active=?, updated_at=CURRENT_TIMESTAMP WHERE id=?',
      [
        name || existing.name,
        description !== undefined ? description : existing.description,
        bullet_points !== undefined ? bullet_points : existing.bullet_points,
        price !== undefined && price !== '' ? parseFloat(price) : existing.price,
        category_id !== undefined ? (category_id || null) : existing.category_id,
        imageUrl,
        stock_count !== undefined ? parseInt(stock_count) : existing.stock_count,
        featured !== undefined ? (featured === '1' || featured === 'true' || featured === true ? 1 : 0) : existing.featured,
        is_active !== undefined ? (is_active === '1' || is_active === 'true' || is_active === true ? 1 : 0) : existing.is_active,
        req.params.id
      ]
    );
    res.json(get('SELECT * FROM products WHERE id = ?', [req.params.id]));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authMiddleware, (req, res) => {
  try {
    run('UPDATE products SET is_active = 0 WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { run, get, all } = require('../db');
const { authMiddleware } = require('../middleware/auth');
const { createPayment, getPaymentStatus } = require('../services/payment');
const { sendOrderDelivery, sendAdminNotification } = require('../services/email');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { customer_email, items } = req.body;
    if (!customer_email || !items || !items.length) {
      return res.status(400).json({ error: 'Email and items required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer_email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    let total = 0;
    const enrichedItems = [];
    for (const item of items) {
      const product = await get(`
        SELECT p.*, (SELECT COUNT(*) FROM digital_stock WHERE product_id = p.id AND is_delivered = 0) as available_stock
        FROM products p WHERE p.id = ? AND p.is_active = 1
      `, [item.product_id]);
      if (!product) return res.status(404).json({ error: `Product ${item.product_id} not found` });
      if (product.available_stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      }
      total += product.price * item.quantity;
      enrichedItems.push({ ...item, name: product.name, price: product.price });
    }

    const orderId = uuidv4();
    const payment = await createPayment(total, orderId, customer_email);

    await run(
      `INSERT INTO orders (id, customer_email, items, total_amount, payment_address, payment_currency, payment_amount, nowpayments_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [orderId, customer_email, JSON.stringify(enrichedItems), total,
       payment.pay_address, payment.pay_currency || 'ltc', payment.pay_amount, payment.payment_id || payment.mock]
    );

    await run('INSERT INTO payment_logs (order_id, event, data) VALUES (?, ?, ?)',
      [orderId, 'order_created', JSON.stringify(payment)]);

    res.status(201).json({ order_id: orderId, total_amount: total, payment });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/status/:orderId', async (req, res) => {
  try {
    const order = await get('SELECT * FROM orders WHERE id = ?', [req.params.orderId]);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (order.payment_status === 'pending' && order.nowpayments_id && !order.nowpayments_id.startsWith('mock_')) {
      const paymentStatus = await getPaymentStatus(order.nowpayments_id);
      if (paymentStatus) {
        const mapped = mapPaymentStatus(paymentStatus.payment_status);
        if (mapped !== order.payment_status) {
          await run('UPDATE orders SET payment_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [mapped, order.id]);
          order.payment_status = mapped;
          if (mapped === 'confirmed') await deliverOrder(order);
        }
      }
    }

    res.json({ ...order, items: JSON.parse(order.items || '[]') });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: search invoices
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const term = `%${q}%`;
    const results = await all(
      `SELECT * FROM orders WHERE id LIKE ? OR customer_email LIKE ? ORDER BY created_at DESC LIMIT 20`,
      [term, term]
    );
    res.json(results.map(o => ({ ...o, items: JSON.parse(o.items || '[]') })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: get single order detail
router.get('/detail/:orderId', authMiddleware, async (req, res) => {
  try {
    const order = await get('SELECT * FROM orders WHERE id = ?', [req.params.orderId]);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ ...order, items: JSON.parse(order.items || '[]') });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function mapPaymentStatus(nowStatus) {
  const map = {
    'waiting': 'pending', 'confirming': 'confirming', 'confirmed': 'confirmed',
    'sending': 'confirmed', 'finished': 'confirmed', 'failed': 'failed',
    'refunded': 'failed', 'expired': 'expired',
  };
  return map[nowStatus] || 'pending';
}

async function deliverOrder(order) {
  if (order.delivery_status === 'delivered') return;
  try {
    const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
    const allStockItems = [];
    for (const item of items) {
      const stockItems = await all(
        'SELECT * FROM digital_stock WHERE product_id = ? AND is_delivered = 0 LIMIT ?',
        [item.product_id, item.quantity]
      );
      const keys = [];
      for (const stock of stockItems) {
        await run('UPDATE digital_stock SET is_delivered = 1, order_id = ?, delivered_at = CURRENT_TIMESTAMP WHERE id = ?', [order.id, stock.id]);
        keys.push(stock.content);
      }
      allStockItems.push(keys);
    }
    await run("UPDATE orders SET delivery_status = 'delivered', payment_status = 'confirmed', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [order.id]);
    const deliveredOrder = { ...order, items };
    await sendOrderDelivery(order.customer_email, deliveredOrder, allStockItems);
    await sendAdminNotification(deliveredOrder);
    console.log(`✅ Order ${order.id} delivered to ${order.customer_email}`);
  } catch (err) {
    console.error('Delivery error:', err);
  }
}

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    let sql = 'SELECT * FROM orders';
    const params = [];
    if (status) { sql += ' WHERE payment_status = ?'; params.push(status); }
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
    const orders = await all(sql, params);
    const total = await get('SELECT COUNT(*) as count FROM orders' + (status ? ' WHERE payment_status = ?' : ''), status ? [status] : []);
    res.json({ orders: orders.map(o => ({ ...o, items: JSON.parse(o.items || '[]') })), total: total.count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/analytics', authMiddleware, async (req, res) => {
  try {
    const totalRevenue = await get("SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE payment_status = 'confirmed'");
    const totalOrders = await get("SELECT COUNT(*) as count FROM orders WHERE payment_status = 'confirmed'");
    const pendingOrders = await get("SELECT COUNT(*) as count FROM orders WHERE payment_status = 'pending'");
    const todayRevenue = await get("SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE payment_status = 'confirmed' AND date(created_at) = date('now')");
    const recentOrders = await all("SELECT * FROM orders ORDER BY created_at DESC LIMIT 5");
    const topProducts = await all(`
      SELECT p.name, COUNT(*) as order_count, SUM(p.price) as revenue
      FROM digital_stock ds JOIN products p ON ds.product_id = p.id
      WHERE ds.is_delivered = 1
      GROUP BY p.id ORDER BY order_count DESC LIMIT 5
    `);
    res.json({
      totalRevenue: totalRevenue.total,
      totalOrders: totalOrders.count,
      pendingOrders: pendingOrders.count,
      todayRevenue: todayRevenue.total,
      recentOrders: recentOrders.map(o => ({ ...o, items: JSON.parse(o.items || '[]') })),
      topProducts,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = { router, deliverOrder };

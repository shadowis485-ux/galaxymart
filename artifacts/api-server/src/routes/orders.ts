import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { run, get, all } from '../db';
import { authMiddleware } from '../middleware/auth';
import { createPayment, getPaymentStatus } from '../services/payment';
import { sendOrderDelivery, sendAdminNotification } from '../services/email';

const router = Router();

function mapPaymentStatus(nowStatus: string) {
  const map: any = {
    waiting: 'pending', confirming: 'confirming', confirmed: 'confirmed',
    sending: 'confirmed', finished: 'confirmed', failed: 'failed',
    refunded: 'failed', expired: 'expired',
  };
  return map[nowStatus] || 'pending';
}

export async function deliverOrder(order: any) {
  if (order.delivery_status === 'delivered') return;
  try {
    const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
    const allStockItems: string[][] = [];
    for (const item of items) {
      const stockItems = all(
        'SELECT * FROM digital_stock WHERE product_id = ? AND is_delivered = 0 LIMIT ?',
        [item.product_id, item.quantity]
      );
      const keys: string[] = [];
      for (const stock of stockItems) {
        run('UPDATE digital_stock SET is_delivered = 1, order_id = ?, delivered_at = CURRENT_TIMESTAMP WHERE id = ?', [order.id, stock.id]);
        keys.push(stock.content);
      }
      allStockItems.push(keys);
    }
    run("UPDATE orders SET delivery_status = 'delivered', payment_status = 'confirmed', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [order.id]);
    await sendOrderDelivery(order.customer_email, { ...order, items }, allStockItems);
    await sendAdminNotification({ ...order, items });
    console.log(`✅ Order ${order.id} delivered to ${order.customer_email}`);
  } catch (err: any) {
    console.error('Delivery error:', err.message);
  }
}

router.post('/', async (req, res) => {
  try {
    const { customer_email, items } = req.body;
    if (!customer_email || !items?.length) return res.status(400).json({ error: 'Email and items required' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer_email)) return res.status(400).json({ error: 'Invalid email' });

    let total = 0;
    const enrichedItems: any[] = [];
    for (const item of items) {
      const product = get(`
        SELECT p.*, (SELECT COUNT(*) FROM digital_stock WHERE product_id = p.id AND is_delivered = 0) as available_stock
        FROM products p WHERE p.id = ? AND p.is_active = 1
      `, [item.product_id]);
      if (!product) return res.status(404).json({ error: `Product ${item.product_id} not found` });
      if (product.available_stock < item.quantity) return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      total += product.price * item.quantity;
      enrichedItems.push({ ...item, name: product.name, price: product.price });
    }

    const orderId = uuidv4();
    const payment = await createPayment(total, orderId, customer_email);

    run(
      `INSERT INTO orders (id, customer_email, items, total_amount, payment_address, payment_currency, payment_amount, nowpayments_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [orderId, customer_email, JSON.stringify(enrichedItems), total,
       payment.pay_address, payment.pay_currency || 'ltc', payment.pay_amount, payment.payment_id || (payment.mock ? `mock_${orderId}` : null)]
    );

    run('INSERT INTO payment_logs (order_id, event, data) VALUES (?, ?, ?)', [orderId, 'order_created', JSON.stringify(payment)]);
    res.status(201).json({ order_id: orderId, total_amount: total, payment });
  } catch (err: any) {
    console.error('Order creation error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/analytics', authMiddleware, (req, res) => {
  try {
    const totalRevenue  = get("SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE payment_status = 'confirmed'");
    const totalOrders   = get("SELECT COUNT(*) as count FROM orders WHERE payment_status = 'confirmed'");
    const pendingOrders = get("SELECT COUNT(*) as count FROM orders WHERE payment_status = 'pending'");
    const todayRevenue  = get("SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE payment_status = 'confirmed' AND date(created_at) = date('now')");
    const recentOrders  = all("SELECT * FROM orders ORDER BY created_at DESC LIMIT 5");
    const topProducts   = all(`
      SELECT p.name, COUNT(*) as order_count, SUM(p.price) as revenue
      FROM digital_stock ds JOIN products p ON ds.product_id = p.id
      WHERE ds.is_delivered = 1 GROUP BY p.id ORDER BY order_count DESC LIMIT 5
    `);
    res.json({
      totalRevenue: totalRevenue.total,
      totalOrders: totalOrders.count,
      pendingOrders: pendingOrders.count,
      todayRevenue: todayRevenue.total,
      recentOrders: recentOrders.map((o: any) => ({ ...o, items: JSON.parse(o.items || '[]') })),
      topProducts,
    });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get('/search', authMiddleware, (req, res) => {
  try {
    const { q } = req.query as any;
    if (!q) return res.json([]);
    const term = `%${q}%`;
    const results = all('SELECT * FROM orders WHERE id LIKE ? OR customer_email LIKE ? ORDER BY created_at DESC LIMIT 20', [term, term]);
    res.json(results.map((o: any) => ({ ...o, items: JSON.parse(o.items || '[]') })));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get('/detail/:orderId', authMiddleware, (req, res) => {
  try {
    const order = get('SELECT * FROM orders WHERE id = ?', [req.params.orderId]);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ ...order, items: JSON.parse(order.items || '[]') });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get('/status/:orderId', async (req, res) => {
  try {
    const order = get('SELECT * FROM orders WHERE id = ?', [req.params.orderId]);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (order.payment_status === 'pending' && order.nowpayments_id && !order.nowpayments_id.startsWith('mock_')) {
      const paymentStatus = await getPaymentStatus(order.nowpayments_id);
      if (paymentStatus) {
        const mapped = mapPaymentStatus(paymentStatus.payment_status);
        if (mapped !== order.payment_status) {
          run('UPDATE orders SET payment_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [mapped, order.id]);
          order.payment_status = mapped;
          if (mapped === 'confirmed') await deliverOrder(order);
        }
      }
    }

    res.json({ ...order, items: JSON.parse(order.items || '[]') });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get('/', authMiddleware, (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query as any;
    let sql = 'SELECT * FROM orders';
    const params: any[] = [];
    if (status) { sql += ' WHERE payment_status = ?'; params.push(status); }
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
    const orders = all(sql, params);
    const total = get('SELECT COUNT(*) as count FROM orders' + (status ? ' WHERE payment_status = ?' : ''), status ? [status] : []);
    res.json({ orders: orders.map((o: any) => ({ ...o, items: JSON.parse(o.items || '[]') })), total: total.count });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;

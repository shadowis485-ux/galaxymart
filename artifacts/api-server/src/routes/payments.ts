import { Router, raw } from 'express';
import crypto from 'crypto';
import { run, get } from '../db';
import { deliverOrder } from './orders';
import { authMiddleware } from '../middleware/auth';

const router = Router();

function mapStatus(nowStatus: string) {
  const map: any = {
    waiting: 'pending', confirming: 'confirming', confirmed: 'confirmed',
    sending: 'confirmed', finished: 'confirmed', failed: 'failed',
    refunded: 'failed', expired: 'expired',
  };
  return map[nowStatus] || 'pending';
}

router.post('/webhook', raw({ type: 'application/json' }), async (req, res) => {
  try {
    const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;
    if (ipnSecret) {
      const sig = req.headers['x-nowpayments-sig'] as string;
      const hmac = crypto.createHmac('sha512', ipnSecret);
      const digest = hmac.update(req.body.toString()).digest('hex');
      if (sig !== digest) return res.status(400).json({ error: 'Invalid signature' });
    }

    const data = JSON.parse(req.body.toString());
    const { order_id, payment_status } = data;
    if (!order_id) return res.status(400).json({ error: 'No order_id' });

    run('INSERT INTO payment_logs (order_id, event, data) VALUES (?, ?, ?)', [order_id, 'webhook', JSON.stringify(data)]);
    const order = get('SELECT * FROM orders WHERE id = ?', [order_id]);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const mapped = mapStatus(payment_status);
    run('UPDATE orders SET payment_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [mapped, order_id]);

    if (mapped === 'confirmed' && order.delivery_status !== 'delivered') {
      await deliverOrder({ ...order, payment_status: mapped });
    }
    res.json({ success: true });
  } catch (err: any) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: err.message });
  }
});

if (process.env.NODE_ENV !== 'production') {
  router.post('/mock-confirm/:orderId', authMiddleware, async (req: any, res) => {
    try {
      const order = get('SELECT * FROM orders WHERE id = ?', [req.params.orderId]);
      if (!order) return res.status(404).json({ error: 'Order not found' });
      run("UPDATE orders SET payment_status = 'confirmed', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [order.id]);
      const updated = get('SELECT * FROM orders WHERE id = ?', [order.id]);
      if (updated.delivery_status !== 'delivered') await deliverOrder(updated);
      res.json({ success: true, message: 'Payment confirmed (mock)' });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });
}

export default router;

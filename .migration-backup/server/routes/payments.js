const express = require('express');
const crypto = require('crypto');
const { run, get } = require('../db');
const { deliverOrder } = require('./orders');

const router = express.Router();

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;
    if (ipnSecret) {
      const sig = req.headers['x-nowpayments-sig'];
      const hmac = crypto.createHmac('sha512', ipnSecret);
      const body = req.body.toString();
      const digest = hmac.update(body).digest('hex');
      if (sig !== digest) {
        console.warn('Invalid webhook signature');
        return res.status(400).json({ error: 'Invalid signature' });
      }
    }

    const data = JSON.parse(req.body.toString());
    const { order_id, payment_status, payment_id } = data;

    if (!order_id) return res.status(400).json({ error: 'No order_id' });

    await run('INSERT INTO payment_logs (order_id, event, data) VALUES (?, ?, ?)',
      [order_id, 'webhook', JSON.stringify(data)]);

    const order = await get('SELECT * FROM orders WHERE id = ?', [order_id]);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const mapped = mapStatus(payment_status);
    await run('UPDATE orders SET payment_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [mapped, order_id]);

    if (mapped === 'confirmed' && order.delivery_status !== 'delivered') {
      await deliverOrder({ ...order, payment_status: mapped });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/mock-confirm/:orderId', async (req, res) => {
  try {
    const order = await get('SELECT * FROM orders WHERE id = ?', [req.params.orderId]);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    await run("UPDATE orders SET payment_status = 'confirmed', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [order.id]);
    const updated = await get('SELECT * FROM orders WHERE id = ?', [order.id]);
    if (updated.delivery_status !== 'delivered') await deliverOrder(updated);
    res.json({ success: true, message: 'Payment confirmed (mock)' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function mapStatus(nowStatus) {
  const map = {
    waiting: 'pending', confirming: 'confirming', confirmed: 'confirmed',
    sending: 'confirmed', finished: 'confirmed', failed: 'failed',
    refunded: 'failed', expired: 'expired',
  };
  return map[nowStatus] || 'pending';
}

module.exports = router;

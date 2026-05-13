const express = require('express');
const { run, get, all } = require('../db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get active LTC address (public)
router.get('/active', async (req, res) => {
  try {
    const addr = await get('SELECT * FROM ltc_addresses WHERE is_active = 1 LIMIT 1');
    if (!addr) return res.json({ address: process.env.LTC_WALLET_ADDRESS || null });
    res.json({ address: addr.address, label: addr.label });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: get all addresses
router.get('/', authMiddleware, async (req, res) => {
  try {
    const addrs = await all('SELECT * FROM ltc_addresses ORDER BY is_active DESC, created_at DESC');
    res.json(addrs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: add address
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { address, label } = req.body;
    if (!address) return res.status(400).json({ error: 'Address required' });
    const result = await run(
      'INSERT INTO ltc_addresses (address, label, is_active) VALUES (?, ?, 0)',
      [address, label || address.slice(0, 12) + '...']
    );
    const addr = await get('SELECT * FROM ltc_addresses WHERE id = ?', [result.id]);
    res.status(201).json(addr);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: set active address
router.put('/:id/activate', authMiddleware, async (req, res) => {
  try {
    await run('UPDATE ltc_addresses SET is_active = 0');
    await run('UPDATE ltc_addresses SET is_active = 1 WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: delete address
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await run('DELETE FROM ltc_addresses WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

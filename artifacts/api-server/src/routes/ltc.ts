import { Router } from 'express';
import { run, get, all } from '../db';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/active', (req, res) => {
  try {
    const addr = get('SELECT * FROM ltc_addresses WHERE is_active = 1 LIMIT 1');
    if (!addr) return res.json({ address: process.env.LTC_WALLET_ADDRESS || null });
    res.json({ address: addr.address, label: addr.label });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.get('/', authMiddleware, (req, res) => {
  try {
    res.json(all('SELECT * FROM ltc_addresses ORDER BY is_active DESC, created_at DESC'));
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.post('/', authMiddleware, (req, res) => {
  try {
    const { address, label } = req.body;
    if (!address) return res.status(400).json({ error: 'Address required' });
    const result = run('INSERT INTO ltc_addresses (address, label, is_active) VALUES (?, ?, 0)', [address, label || address.slice(0,12)+'...']);
    const addr = get('SELECT * FROM ltc_addresses WHERE id = ?', [result.lastInsertRowid]);
    res.status(201).json(addr);
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.put('/:id/activate', authMiddleware, (req, res) => {
  try {
    run('UPDATE ltc_addresses SET is_active = 0');
    run('UPDATE ltc_addresses SET is_active = 1 WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authMiddleware, (req, res) => {
  try {
    run('DELETE FROM ltc_addresses WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err: any) { res.status(500).json({ error: err.message }); }
});

export default router;

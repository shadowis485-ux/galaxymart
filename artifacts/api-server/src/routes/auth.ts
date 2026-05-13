import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { get } from '../db';
import { authMiddleware, generateToken } from '../middleware/auth';

const router = Router();

router.post('/login', (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'Password required' });

    const admin = get('SELECT * FROM admins LIMIT 1');
    if (!admin) return res.status(503).json({ error: 'Admin account not initialized' });

    const valid = bcrypt.compareSync(password, admin.password);
    if (!valid) return res.status(401).json({ error: 'Wrong admin password' });

    const token = generateToken({ role: 'admin', email: admin.email });
    res.json({ token, email: admin.email });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/me', authMiddleware, (req: any, res) => {
  res.json({ admin: req.admin });
});

export default router;

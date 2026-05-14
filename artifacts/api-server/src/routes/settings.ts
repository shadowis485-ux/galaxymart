import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { getSetting, setSetting, run, get } from '../db';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', (req, res) => {
  try {
    res.json({
      store_name: getSetting('store_name') || 'Galaxymart',
      logo_url:   getSetting('logo_url')   || '',
      store_tagline: getSetting('store_tagline') || 'Premium digital products delivered instantly.',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/', authMiddleware, (req, res) => {
  try {
    const { store_name, logo_url, store_tagline } = req.body;
    if (store_name !== undefined) setSetting('store_name', String(store_name).trim() || 'Galaxymart');
    if (logo_url    !== undefined) setSetting('logo_url', String(logo_url).trim());
    if (store_tagline !== undefined) setSetting('store_tagline', String(store_tagline).trim());
    res.json({
      store_name: getSetting('store_name'),
      logo_url:   getSetting('logo_url'),
      store_tagline: getSetting('store_tagline'),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/password', authMiddleware, (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password)
      return res.status(400).json({ error: 'current_password and new_password required' });
    if (new_password.length < 6)
      return res.status(400).json({ error: 'New password must be at least 6 characters' });

    const admin = get('SELECT * FROM admins LIMIT 1');
    if (!admin) return res.status(404).json({ error: 'Admin not found' });

    const valid = bcrypt.compareSync(current_password, admin.password);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });

    const hashed = bcrypt.hashSync(new_password, 10);
    run('UPDATE admins SET password = ? WHERE id = ?', [hashed, admin.id]);
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

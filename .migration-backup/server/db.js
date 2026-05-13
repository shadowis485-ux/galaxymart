const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// In production on Render, use the persistent disk path
// Otherwise use local server directory
const DATA_DIR = process.env.DATA_DIR ||
  (process.env.NODE_ENV === 'production'
    ? '/opt/render/project/src/data'
    : __dirname);

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = path.join(DATA_DIR, 'dragonzstore.db');
console.log(`📂 Database: ${DB_PATH}`);

const db = new sqlite3.Database(DB_PATH);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function init() {
  db.serialize(async () => {
    db.run(`PRAGMA journal_mode=WAL`);
    db.run(`PRAGMA foreign_keys=ON`);

    db.run(`CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      slug TEXT NOT NULL UNIQUE,
      icon TEXT DEFAULT '📦',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      bullet_points TEXT,
      price REAL,
      category_id INTEGER,
      image_url TEXT,
      stock_count INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      featured INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS digital_stock (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      is_delivered INTEGER DEFAULT 0,
      order_id TEXT,
      delivered_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS ltc_addresses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      address TEXT NOT NULL UNIQUE,
      label TEXT,
      is_active INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customer_email TEXT NOT NULL,
      items TEXT NOT NULL,
      total_amount REAL NOT NULL,
      payment_status TEXT DEFAULT 'pending',
      delivery_status TEXT DEFAULT 'pending',
      payment_address TEXT,
      payment_currency TEXT DEFAULT 'ltc',
      payment_amount REAL,
      nowpayments_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS payment_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT,
      event TEXT,
      data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      comment TEXT,
      product_id INTEGER,
      is_approved INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    setTimeout(async () => {
      await migrate();
      await seedData();
    }, 500);
  });
}

async function migrate() {
  // Safe column additions — ignore errors if column already exists
  const migrations = [
    'ALTER TABLE products ADD COLUMN bullet_points TEXT',
    'ALTER TABLE products ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP',
    `CREATE TABLE IF NOT EXISTS ltc_addresses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      address TEXT NOT NULL UNIQUE,
      label TEXT,
      is_active INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
  ];
  for (const sql of migrations) {
    try { await run(sql); } catch (_) {}
  }
}

async function seedData() {
  try {
    const adminExists = await get('SELECT id FROM admins LIMIT 1');
    if (!adminExists) {
      const password = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
      await run('INSERT INTO admins (email, password) VALUES (?, ?)', [
        process.env.ADMIN_EMAIL || 'admin@dragonzstore.com', password
      ]);
      console.log('✅ Admin created');
    }

    const catExists = await get('SELECT id FROM categories LIMIT 1');
    if (!catExists) {
      const cats = [
        ['Accounts',      'accounts',    '👤'],
        ['Software',      'software',    '💻'],
        ['Gaming',        'gaming',      '🎮'],
        ['Tools',         'tools',       '🔧'],
        ['Social Media',  'social-media','📱'],
        ['VPN & Security','vpn-security','🔒'],
      ];
      for (const [name, slug, icon] of cats) {
        await run('INSERT OR IGNORE INTO categories (name, slug, icon) VALUES (?, ?, ?)', [name, slug, icon]);
      }

      const cat        = await get('SELECT id FROM categories WHERE slug = ?', ['accounts']);
      const gamingCat  = await get('SELECT id FROM categories WHERE slug = ?', ['gaming']);
      const toolsCat   = await get('SELECT id FROM categories WHERE slug = ?', ['tools']);

      const products = [
        ['Netflix Premium 1 Month',  'Stream unlimited movies and TV shows in Ultra HD on up to 4 screens.', '• Ultra HD 4K streaming\n• 4 simultaneous screens\n• Download on 4 devices\n• No ads, cancel anytime',  4.99,  cat.id,       50, 1],
        ['Spotify Premium 3 Months', 'Listen to millions of songs and podcasts without interruptions.',       '• Ad-free music\n• Offline downloads\n• Unlimited skips\n• High quality audio',                         3.99,  cat.id,       30, 1],
        ['Disney+ Bundle 1 Month',   'Access Disney+, Hulu, and ESPN+ all in one bundle.',                   '• Disney+ full library\n• Hulu streaming\n• ESPN+ sports\n• 4K content available',                      5.99,  cat.id,       25, 0],
        ['Steam Gift Card $10',      'Add $10 to your Steam wallet. Works globally.',                        '• Instant code delivery\n• Works worldwide\n• No expiry date\n• All Steam games',                        9.99,  gamingCat.id,100, 1],
        ['Minecraft Java Edition',   'Full access Minecraft Java Edition account with all features.',         '• Full game access\n• All updates included\n• Multiplayer enabled\n• Skin customization',               12.99, gamingCat.id, 15, 1],
        ['Windows 11 Pro Key',       'Genuine Windows 11 Pro license key for lifetime activation.',           '• Lifetime activation\n• Genuine Microsoft key\n• 1 PC license\n• All languages',                      19.99, toolsCat.id,  50, 1],
        ['ChatGPT Plus 1 Month',     'GPT-4 access with ChatGPT Plus subscription account.',                 '• GPT-4 access\n• Faster responses\n• Priority access\n• Advanced features',                           14.99, toolsCat.id,  40, 1],
        ['NordVPN 1 Year',           'NordVPN 1-year premium subscription for all your devices.',             '• 5000+ servers\n• 6 simultaneous devices\n• No-log policy\n• 24/7 support',                           24.99, toolsCat.id,  20, 0],
      ];

      for (const [name, desc, bullets, price, catId, stock, featured] of products) {
        const result = await run(
          'INSERT INTO products (name, description, bullet_points, price, category_id, stock_count, featured) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [name, desc, bullets, price, catId, stock, featured]
        );
        for (let i = 0; i < Math.min(stock, 5); i++) {
          await run('INSERT INTO digital_stock (product_id, content) VALUES (?, ?)',
            [result.id, `KEY-${result.id}${i+1}-XXXX-YYYY-${Math.random().toString(36).substr(2,6).toUpperCase()}`]);
        }
      }
      console.log('✅ Products seeded');

      const sampleReviews = [
        ['Alex M.',  5, 'Instant delivery, works perfectly! Totally legit.'],
        ['Sarah K.', 5, 'Super fast and reliable. Already bought 3 times.'],
        ['Mike R.',  4, 'Good service, key worked first try. Will buy again.'],
        ['Emma T.',  5, 'Cheapest prices I found anywhere. Highly recommend!'],
        ['James L.', 5, 'Lightning fast delivery. Support is helpful too.'],
        ['Priya S.', 5, 'Amazing store! All products work as advertised.'],
      ];
      for (const [name, rating, comment] of sampleReviews) {
        await run('INSERT INTO reviews (customer_name, rating, comment) VALUES (?, ?, ?)', [name, rating, comment]);
      }

      if (process.env.LTC_WALLET_ADDRESS) {
        await run('INSERT OR IGNORE INTO ltc_addresses (address, label, is_active) VALUES (?, ?, 1)',
          [process.env.LTC_WALLET_ADDRESS, 'Primary Wallet']);
      }
      console.log('✅ Seed data complete');
    }
  } catch (err) {
    console.error('Seed error:', err.message);
  }
}

module.exports = { db, run, get, all, init };

const P = 'gm_';
const k = {
  products:    P + 'products',
  categories:  P + 'categories',
  reviews:     P + 'reviews',
  orders:      P + 'orders',
  stock:       P + 'stock',
  ltc:         P + 'ltc',
  settings:    P + 'settings',
  admin:       P + 'admin',
  seeded:      P + 'seeded',
};

const read = <T>(key: string, def: T): T => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : def;
  } catch { return def; }
};
const write = (key: string, val: any) => {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
};

const uid   = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
const ts    = () => new Date().toISOString();
const intId = () => Date.now() + Math.floor(Math.random() * 1000);

function ensureSeeded() {
  if (read(k.seeded, false)) return;

  const cats = [
    { id: 1, name: 'Accounts',       slug: 'accounts',     icon: '👤', created_at: ts(), product_count: 3 },
    { id: 2, name: 'Software',       slug: 'software',     icon: '💻', created_at: ts(), product_count: 0 },
    { id: 3, name: 'Gaming',         slug: 'gaming',       icon: '🎮', created_at: ts(), product_count: 2 },
    { id: 4, name: 'Tools',          slug: 'tools',        icon: '🔧', created_at: ts(), product_count: 3 },
    { id: 5, name: 'Social Media',   slug: 'social-media', icon: '📱', created_at: ts(), product_count: 0 },
    { id: 6, name: 'VPN & Security', slug: 'vpn-security', icon: '🔒', created_at: ts(), product_count: 0 },
  ];
  write(k.categories, cats);

  const products = [
    { id: 1, name: 'Netflix Premium 1 Month',  description: 'Stream unlimited movies in Ultra HD.', bullet_points: '• Ultra HD 4K streaming\n• 4 simultaneous screens\n• Download on 4 devices\n• No ads, cancel anytime', price: 4.99,  category_id: 1, category_name: 'Accounts',  category_slug: 'accounts', image_url: '', stock_count: 50, available_stock: 50, is_active: 1, featured: 1, created_at: ts(), updated_at: ts() },
    { id: 2, name: 'Spotify Premium 3 Months', description: 'Ad-free music without interruptions.',  bullet_points: '• Ad-free music\n• Offline downloads\n• Unlimited skips\n• High quality audio',                    price: 3.99,  category_id: 1, category_name: 'Accounts',  category_slug: 'accounts', image_url: '', stock_count: 30, available_stock: 30, is_active: 1, featured: 1, created_at: ts(), updated_at: ts() },
    { id: 3, name: 'Disney+ Bundle 1 Month',   description: 'Access Disney+, Hulu, and ESPN+.',      bullet_points: '• Disney+ full library\n• Hulu streaming\n• ESPN+ sports\n• 4K content available',                 price: 5.99,  category_id: 1, category_name: 'Accounts',  category_slug: 'accounts', image_url: '', stock_count: 25, available_stock: 25, is_active: 1, featured: 0, created_at: ts(), updated_at: ts() },
    { id: 4, name: 'Steam Gift Card $10',       description: 'Add $10 to your Steam wallet.',         bullet_points: '• Instant code delivery\n• Works worldwide\n• No expiry date\n• All Steam games',                  price: 9.99,  category_id: 3, category_name: 'Gaming',    category_slug: 'gaming',   image_url: '', stock_count: 100, available_stock: 100, is_active: 1, featured: 1, created_at: ts(), updated_at: ts() },
    { id: 5, name: 'Minecraft Java Edition',    description: 'Full access Minecraft Java account.',   bullet_points: '• Full game access\n• All updates included\n• Multiplayer enabled\n• Skin customization',         price: 12.99, category_id: 3, category_name: 'Gaming',    category_slug: 'gaming',   image_url: '', stock_count: 15,  available_stock: 15,  is_active: 1, featured: 1, created_at: ts(), updated_at: ts() },
    { id: 6, name: 'Windows 11 Pro Key',        description: 'Genuine Windows 11 Pro license key.',   bullet_points: '• Lifetime activation\n• Genuine Microsoft key\n• 1 PC license\n• All languages',                 price: 19.99, category_id: 4, category_name: 'Tools',     category_slug: 'tools',    image_url: '', stock_count: 50,  available_stock: 50,  is_active: 1, featured: 1, created_at: ts(), updated_at: ts() },
    { id: 7, name: 'ChatGPT Plus 1 Month',      description: 'GPT-4 access with ChatGPT Plus.',       bullet_points: '• GPT-4 access\n• Faster responses\n• Priority access\n• Advanced features',                     price: 14.99, category_id: 4, category_name: 'Tools',     category_slug: 'tools',    image_url: '', stock_count: 40,  available_stock: 40,  is_active: 1, featured: 1, created_at: ts(), updated_at: ts() },
    { id: 8, name: 'NordVPN 1 Year',            description: 'NordVPN 1-year premium subscription.',  bullet_points: '• 5000+ servers\n• 6 simultaneous devices\n• No-log policy\n• 24/7 support',                     price: 24.99, category_id: 4, category_name: 'Tools',     category_slug: 'tools',    image_url: '', stock_count: 20,  available_stock: 20,  is_active: 1, featured: 0, created_at: ts(), updated_at: ts() },
  ];
  write(k.products, products);

  const stockItems: any[] = [];
  products.forEach(p => {
    for (let i = 0; i < Math.min(p.stock_count, 5); i++) {
      stockItems.push({ id: intId() + i, product_id: p.id, content: `KEY-${p.id}${i+1}-XXXX-YYYY-${Math.random().toString(36).slice(2,8).toUpperCase()}`, is_delivered: 0, order_id: null, delivered_at: null, created_at: ts() });
    }
  });
  write(k.stock, stockItems);

  write(k.reviews, [
    { id: 1, customer_name: 'Alex M.',  rating: 5, comment: 'Instant delivery, works perfectly! Totally legit.',             product_id: null, is_approved: 1, created_at: ts() },
    { id: 2, customer_name: 'Sarah K.', rating: 5, comment: 'Super fast and reliable. Already bought 3 times.',              product_id: null, is_approved: 1, created_at: ts() },
    { id: 3, customer_name: 'Mike R.',  rating: 4, comment: 'Good service, key worked first try. Will buy again.',           product_id: null, is_approved: 1, created_at: ts() },
    { id: 4, customer_name: 'Emma T.',  rating: 5, comment: 'Cheapest prices I found anywhere. Highly recommend!',           product_id: null, is_approved: 1, created_at: ts() },
    { id: 5, customer_name: 'James L.', rating: 5, comment: 'Lightning fast delivery. Support is helpful too.',              product_id: null, is_approved: 1, created_at: ts() },
    { id: 6, customer_name: 'Priya S.', rating: 5, comment: 'Amazing store! All products work as advertised.',               product_id: null, is_approved: 1, created_at: ts() },
  ]);

  write(k.orders, []);
  write(k.ltc, []);

  write(k.settings, {
    store_name:    'Galaxymart',
    logo_url:      '',
    store_tagline: 'Premium digital products delivered instantly.',
  });

  write(k.admin, {
    email:    'admin@galaxymart.com',
    password: 'admin123',
  });

  write(k.seeded, true);
}

function fdToObj(data: any): Record<string, any> {
  if (data instanceof FormData) {
    const obj: Record<string, any> = {};
    data.forEach((v, k) => { obj[k] = v; });
    return obj;
  }
  return data || {};
}

function rebuildProductCounts(prods: any[], cats: any[]) {
  return cats.map(c => ({
    ...c,
    product_count: prods.filter((p: any) => p.category_id === c.id && p.is_active !== 0 && p.is_active !== '0').length,
  }));
}

function attachCategory(p: any, cats: any[]): any {
  const cat = cats.find((c: any) => c.id === p.category_id);
  return { ...p, category_name: cat?.name || null, category_slug: cat?.slug || null };
}

export const localStore = {
  init() { ensureSeeded(); },

  // ── SETTINGS ────────────────────────────────────────────────────────────
  getSettings() {
    ensureSeeded();
    return read(k.settings, { store_name: 'Galaxymart', logo_url: '', store_tagline: 'Premium digital products delivered instantly.' });
  },
  updateSettings(data: { store_name?: string; logo_url?: string; store_tagline?: string }) {
    const s = this.getSettings();
    const updated = {
      store_name:    data.store_name    !== undefined ? (data.store_name    || 'Galaxymart') : s.store_name,
      logo_url:      data.logo_url      !== undefined ? data.logo_url                         : s.logo_url,
      store_tagline: data.store_tagline !== undefined ? data.store_tagline                    : s.store_tagline,
    };
    write(k.settings, updated);
    return updated;
  },

  // ── ADMIN AUTH ───────────────────────────────────────────────────────────
  login(password: string): { token: string; email: string } | null {
    ensureSeeded();
    const admin = read<any>(k.admin, {});
    if (password !== admin.password) return null;
    return { token: 'local_' + uid(), email: admin.email };
  },
  getAdmin() {
    ensureSeeded();
    return read<any>(k.admin, {});
  },
  changePassword(current: string, next: string) {
    const admin = this.getAdmin();
    if (current !== admin.password) throw new Error('Current password is incorrect');
    write(k.admin, { ...admin, password: next });
    return { success: true };
  },

  // ── PRODUCTS ─────────────────────────────────────────────────────────────
  getProducts(params?: { category?: string; search?: string; featured?: string }) {
    ensureSeeded();
    const cats = read<any[]>(k.categories, []);
    let prods  = read<any[]>(k.products, []).filter((p: any) => p.is_active !== 0 && p.is_active !== '0');
    if (params?.category && params.category !== 'all') prods = prods.filter((p: any) => p.category_slug === params.category);
    if (params?.search) { const q = params.search.toLowerCase(); prods = prods.filter((p: any) => p.name.toLowerCase().includes(q) || (p.description||'').toLowerCase().includes(q)); }
    if (params?.featured === 'true') prods = prods.filter((p: any) => p.featured === 1 || p.featured === true);
    return prods.map((p: any) => attachCategory(p, cats)).sort((a: any, b: any) => (b.featured||0) - (a.featured||0));
  },
  getAllProducts() {
    ensureSeeded();
    const cats = read<any[]>(k.categories, []);
    return read<any[]>(k.products, []).map((p: any) => attachCategory(p, cats));
  },
  getProduct(id: number | string) {
    ensureSeeded();
    const cats = read<any[]>(k.categories, []);
    const p = read<any[]>(k.products, []).find((p: any) => p.id === Number(id) && (p.is_active !== 0 && p.is_active !== '0'));
    return p ? attachCategory(p, cats) : null;
  },
  getProductStats() {
    ensureSeeded();
    const prods   = read<any[]>(k.products, []).filter((p: any) => p.is_active !== 0);
    const orders  = read<any[]>(k.orders,   []).filter((o: any) => o.payment_status === 'confirmed');
    const reviews = read<any[]>(k.reviews,  []);
    const total = orders.reduce((s: number, o: any) => s + (o.total_amount || 0), 0);
    const avg   = reviews.length ? (reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length).toFixed(1) : '5.0';
    return { products: prods.length, orders: orders.length, revenue: total, rating: avg };
  },
  createProduct(data: any) {
    ensureSeeded();
    const obj  = fdToObj(data);
    const cats = read<any[]>(k.categories, []);
    const prods = read<any[]>(k.products, []);
    const id   = prods.length ? Math.max(...prods.map((p: any) => p.id)) + 1 : 1;
    const cat  = cats.find((c: any) => c.id === Number(obj.category_id));
    const p = {
      id, name: obj.name || 'New Product', description: obj.description || '',
      bullet_points: obj.bullet_points || '', price: obj.price ? parseFloat(obj.price) : null,
      category_id: obj.category_id ? Number(obj.category_id) : null,
      category_name: cat?.name || null, category_slug: cat?.slug || null,
      image_url: obj.image_url || '', stock_count: parseInt(obj.stock_count) || 0,
      available_stock: parseInt(obj.stock_count) || 0,
      is_active: obj.is_active === '0' || obj.is_active === false ? 0 : 1,
      featured: obj.featured === '1' || obj.featured === true ? 1 : 0,
      created_at: ts(), updated_at: ts(),
    };
    prods.push(p);
    write(k.products, prods);
    return p;
  },
  updateProduct(id: number | string, data: any) {
    ensureSeeded();
    const obj  = fdToObj(data);
    const cats = read<any[]>(k.categories, []);
    const prods = read<any[]>(k.products, []);
    const idx  = prods.findIndex((p: any) => p.id === Number(id));
    if (idx === -1) throw new Error('Product not found');
    const existing = prods[idx];
    const cat = obj.category_id ? cats.find((c: any) => c.id === Number(obj.category_id)) : cats.find((c: any) => c.id === existing.category_id);
    const updated = {
      ...existing,
      name:          obj.name          !== undefined ? obj.name          : existing.name,
      description:   obj.description   !== undefined ? obj.description   : existing.description,
      bullet_points: obj.bullet_points !== undefined ? obj.bullet_points : existing.bullet_points,
      price:         obj.price !== undefined && obj.price !== '' ? parseFloat(obj.price) : (obj.price === '' ? null : existing.price),
      category_id:   obj.category_id   !== undefined ? (obj.category_id ? Number(obj.category_id) : null) : existing.category_id,
      category_name: cat?.name || existing.category_name,
      category_slug: cat?.slug || existing.category_slug,
      image_url:     obj.image_url     !== undefined ? obj.image_url     : existing.image_url,
      stock_count:   obj.stock_count   !== undefined ? parseInt(obj.stock_count) : existing.stock_count,
      is_active:     obj.is_active     !== undefined ? (obj.is_active === '0' || obj.is_active === false || obj.is_active === 'false' ? 0 : 1) : existing.is_active,
      featured:      obj.featured      !== undefined ? (obj.featured === '1' || obj.featured === true || obj.featured === 'true' ? 1 : 0) : existing.featured,
      updated_at:    ts(),
    };
    updated.available_stock = updated.stock_count;
    prods[idx] = updated;
    write(k.products, prods);
    return updated;
  },
  deleteProduct(id: number | string) {
    const prods = read<any[]>(k.products, []);
    const idx   = prods.findIndex((p: any) => p.id === Number(id));
    if (idx !== -1) { prods[idx].is_active = 0; write(k.products, prods); }
    return { success: true };
  },

  // ── CATEGORIES ───────────────────────────────────────────────────────────
  getCategories() {
    ensureSeeded();
    const prods = read<any[]>(k.products, []).filter((p: any) => p.is_active !== 0);
    const cats  = read<any[]>(k.categories, []);
    return rebuildProductCounts(prods, cats);
  },
  createCategory(data: any) {
    ensureSeeded();
    const cats = read<any[]>(k.categories, []);
    const slug = (data.name || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const id   = cats.length ? Math.max(...cats.map((c: any) => c.id)) + 1 : 1;
    const cat  = { id, name: data.name, slug, icon: data.icon || '📦', created_at: ts(), product_count: 0 };
    cats.push(cat);
    write(k.categories, cats);
    return cat;
  },
  deleteCategory(id: number | string) {
    const cats = read<any[]>(k.categories, []);
    write(k.categories, cats.filter((c: any) => c.id !== Number(id)));
    return { success: true };
  },

  // ── REVIEWS ──────────────────────────────────────────────────────────────
  getReviews() {
    ensureSeeded();
    return read<any[]>(k.reviews, []).filter((r: any) => r.is_approved !== 0);
  },
  createReview(data: any) {
    ensureSeeded();
    const reviews = read<any[]>(k.reviews, []);
    const id = reviews.length ? Math.max(...reviews.map((r: any) => r.id)) + 1 : 1;
    const r = { id, customer_name: data.customer_name, rating: Number(data.rating), comment: data.comment || '', product_id: data.product_id || null, is_approved: 1, created_at: ts() };
    reviews.push(r);
    write(k.reviews, reviews);
    return r;
  },
  deleteReview(id: number | string) {
    const reviews = read<any[]>(k.reviews, []);
    write(k.reviews, reviews.filter((r: any) => r.id !== Number(id)));
    return { success: true };
  },

  // ── STOCK ─────────────────────────────────────────────────────────────────
  getStockByProduct(productId: number | string) {
    ensureSeeded();
    return read<any[]>(k.stock, []).filter((s: any) => s.product_id === Number(productId));
  },
  addStock(data: { product_id: string | number; items: string }) {
    ensureSeeded();
    const lines = (data.items || '').split('\n').map((l: string) => l.trim()).filter(Boolean);
    const stock  = read<any[]>(k.stock, []);
    const added  = lines.map((content: string) => {
      const item = { id: intId(), product_id: Number(data.product_id), content, is_delivered: 0, order_id: null, delivered_at: null, created_at: ts() };
      stock.push(item);
      return item;
    });
    write(k.stock, stock);
    const prods = read<any[]>(k.products, []);
    const idx   = prods.findIndex((p: any) => p.id === Number(data.product_id));
    if (idx !== -1) {
      const available = stock.filter((s: any) => s.product_id === Number(data.product_id) && !s.is_delivered).length;
      prods[idx].stock_count = available;
      prods[idx].available_stock = available;
      write(k.products, prods);
    }
    return { added: added.length, total_stock: stock.filter((s: any) => s.product_id === Number(data.product_id) && !s.is_delivered).length };
  },
  deleteStockItem(id: number | string) {
    const stock = read<any[]>(k.stock, []);
    write(k.stock, stock.filter((s: any) => s.id !== Number(id)));
    return { success: true };
  },

  // ── ORDERS ────────────────────────────────────────────────────────────────
  getOrders(params?: any) {
    ensureSeeded();
    const orders = read<any[]>(k.orders, []);
    return { orders, total: orders.length };
  },
  searchOrders(q: string) {
    ensureSeeded();
    const lq = q.toLowerCase();
    return read<any[]>(k.orders, []).filter((o: any) => o.id?.toLowerCase().includes(lq) || o.customer_email?.toLowerCase().includes(lq));
  },
  getAnalytics() {
    ensureSeeded();
    const orders    = read<any[]>(k.orders, []);
    const confirmed = orders.filter((o: any) => o.payment_status === 'confirmed');
    const pending   = orders.filter((o: any) => o.payment_status === 'pending');
    const today     = new Date().toDateString();
    const todayRev  = confirmed.filter((o: any) => new Date(o.created_at).toDateString() === today).reduce((s: number, o: any) => s + (o.total_amount || 0), 0);
    const prods     = read<any[]>(k.products, []);
    return {
      totalRevenue:  confirmed.reduce((s: number, o: any) => s + (o.total_amount || 0), 0),
      totalOrders:   confirmed.length,
      pendingOrders: pending.length,
      todayRevenue:  todayRev,
      recentOrders:  [...orders].reverse().slice(0, 10),
      topProducts:   prods.slice(0, 5).map((p: any) => ({ name: p.name, order_count: 0, revenue: 0 })),
    };
  },

  // ── LTC ADDRESSES ─────────────────────────────────────────────────────────
  getLtcAddresses() {
    ensureSeeded();
    return read<any[]>(k.ltc, []);
  },
  getActiveLtc() {
    return read<any[]>(k.ltc, []).find((a: any) => a.is_active) || null;
  },
  addLtcAddress(data: { address: string; label?: string }) {
    const list = read<any[]>(k.ltc, []);
    const id   = list.length ? Math.max(...list.map((a: any) => a.id)) + 1 : 1;
    const item = { id, address: data.address, label: data.label || '', is_active: 0, created_at: ts() };
    list.push(item);
    write(k.ltc, list);
    return item;
  },
  activateLtcAddress(id: number | string) {
    const list = read<any[]>(k.ltc, []).map((a: any) => ({ ...a, is_active: a.id === Number(id) ? 1 : 0 }));
    write(k.ltc, list);
    return { success: true };
  },
  deleteLtcAddress(id: number | string) {
    write(k.ltc, read<any[]>(k.ltc, []).filter((a: any) => a.id !== Number(id)));
    return { success: true };
  },
};

export default localStore;

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, Tag, ShoppingBag, Star, LogOut, Plus, Trash2, Edit,
  TrendingUp, DollarSign, Clock, X, RefreshCw, Bitcoin, AlertTriangle, Layers,
  Search, FileText, DollarSign as PriceIcon, Settings, ChevronRight, Check,
  Eye, Minus, Menu, Copy, Mail, Calendar, CreditCard
} from 'lucide-react';
import { productsApi, categoriesApi, ordersApi, reviewsApi, stockApi, ltcApi } from '../lib/api';
import toast from 'react-hot-toast';

const NAV = [
  { id: 'dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { id: 'products',  label: 'Products',   icon: Package },
  { id: 'stock',     label: 'Stock',      icon: Layers },
  { id: 'invoices',  label: 'Invoices',   icon: FileText },
  { id: 'categories',label: 'Categories', icon: Tag },
  { id: 'pricing',   label: 'Pricing',    icon: PriceIcon },
  { id: 'settings',  label: 'Settings',   icon: Settings },
];

/* ─── helpers ─── */
const statusColor = (s) => ({ confirmed:'text-green-400', pending:'text-yellow-400', failed:'text-red-400', expired:'text-gray-500', confirming:'text-blue-400' }[s] || 'text-gray-400');
const statusBg    = (s) => ({ confirmed:'status-confirmed', pending:'status-pending', failed:'status-failed', expired:'status-expired', confirming:'status-confirming' }[s] || '');
const fmt = (n) => n != null ? `$${Number(n).toFixed(2)}` : '—';

/* ─── reusable components ─── */
function StatCard({ icon: Icon, label, value, sub, color = 'bg-neon-500' }) {
  return (
    <div className="glass-card p-5 hover:scale-[1.02] transition-transform">
      <div className="flex items-center justify-between mb-3">
        <p className="text-gray-500 text-xs uppercase tracking-wider">{label}</p>
        <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center`}>
          <Icon size={17} className="text-black" />
        </div>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      {sub && <p className="text-gray-600 text-xs mt-1">{sub}</p>}
    </div>
  );
}

function Modal({ title, onClose, wide, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <motion.div
        initial={{ opacity:0, scale:0.92 }}
        animate={{ opacity:1, scale:1 }}
        exit={{ opacity:0, scale:0.92 }}
        className={`glass-card p-6 w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-bold text-lg">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X size={20}/></button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

function ConfirmModal({ message, sub, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
        className="glass-card p-6 w-full max-w-sm"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertTriangle size={18} className="text-red-400"/>
          </div>
          <h3 className="text-white font-bold">Confirm Delete</h3>
        </div>
        <p className="text-gray-300 text-sm mb-1">{message}</p>
        {sub && <p className="text-gray-500 text-xs mb-5">{sub}</p>}
        <div className="flex gap-3 mt-5">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl text-sm text-gray-400 border border-white/10 hover:border-white/20 transition-all">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500/80 hover:bg-red-500 transition-all">Delete</button>
        </div>
      </motion.div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      {label && <label className="text-gray-400 text-sm mb-1.5 block">{label}</label>}
      <input className="input-gold w-full px-4 py-3 text-sm" {...props}/>
    </div>
  );
}

function Textarea({ label, ...props }) {
  return (
    <div>
      {label && <label className="text-gray-400 text-sm mb-1.5 block">{label}</label>}
      <textarea className="input-gold w-full px-4 py-3 text-sm resize-none" {...props}/>
    </div>
  );
}

function Select({ label, children, ...props }) {
  return (
    <div>
      {label && <label className="text-gray-400 text-sm mb-1.5 block">{label}</label>}
      <select className="input-gold w-full px-4 py-3 text-sm bg-transparent" {...props}>{children}</select>
    </div>
  );
}

function EmptyState({ icon: Icon, text, sub }) {
  return (
    <div className="text-center py-16 text-gray-600">
      <Icon size={36} className="mx-auto mb-3 opacity-25"/>
      <p className="text-sm font-medium text-gray-500">{text}</p>
      {sub && <p className="text-xs mt-1">{sub}</p>}
    </div>
  );
}

/* ─── Main Dashboard ─── */
export default function AdminDashboard({ setPage }) {
  const [tab, setTab]               = useState('dashboard');
  const [analytics, setAnalytics]   = useState(null);
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders]         = useState([]);
  const [reviews, setReviews]       = useState([]);
  const [ltcAddresses, setLtc]      = useState([]);
  const [stockItems, setStockItems] = useState([]);
  const [stockPid, setStockPid]     = useState('');
  const [loading, setLoading]       = useState(false);
  const [modal, setModal]           = useState(null);
  const [confirm, setConfirm]       = useState(null);
  const [sideOpen, setSideOpen]     = useState(false);
  const [orderFilter, setOrderFilter] = useState('');

  // Invoice search
  const [invoiceQuery, setInvoiceQuery] = useState('');
  const [invoiceResults, setInvoiceResults] = useState([]);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const searchTimeout = useRef(null);

  const adminEmail = localStorage.getItem('admin_email') || 'admin';

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_email');
    setPage('home');
    toast.success('Logged out');
  };

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { setPage('admin-login'); return; }
    loadTab(tab);
  }, [tab]);

  const loadTab = async (t) => {
    setLoading(true);
    try {
      if (t === 'dashboard') {
        const [anal, prods, cats] = await Promise.all([ordersApi.getAnalytics(), productsApi.getAll({}), categoriesApi.getAll()]);
        setAnalytics(anal); setProducts(prods); setCategories(cats);
      } else if (t === 'products') {
        const [prods, cats] = await Promise.all([productsApi.getAll({}), categoriesApi.getAll()]);
        setProducts(prods); setCategories(cats);
      } else if (t === 'categories') {
        setCategories(await categoriesApi.getAll());
      } else if (t === 'orders') {
        const { orders: o } = await ordersApi.getAll(orderFilter ? { status: orderFilter } : {});
        setOrders(o);
      } else if (t === 'stock') {
        setProducts(await productsApi.getAll({}));
        if (stockPid) { setStockItems(await stockApi.getByProduct(stockPid)); }
      } else if (t === 'invoices') {
        setInvoiceResults([]);
      } else if (t === 'pricing') {
        setProducts(await productsApi.getAll({}));
      } else if (t === 'settings') {
        const [ltc, revs] = await Promise.all([ltcApi.getAll(), reviewsApi.getAll()]);
        setLtc(ltc); setReviews(revs);
      }
    } catch (err) {
      if (err.message?.includes('401') || err.message?.includes('Invalid token')) logout();
    } finally {
      setLoading(false);
    }
  };

  /* ── invoice search ── */
  const handleInvoiceSearch = (q) => {
    setInvoiceQuery(q);
    clearTimeout(searchTimeout.current);
    if (!q.trim()) { setInvoiceResults([]); return; }
    searchTimeout.current = setTimeout(async () => {
      setInvoiceLoading(true);
      try {
        const res = await ordersApi.search(q.trim());
        setInvoiceResults(res);
      } catch { toast.error('Search failed'); }
      finally { setInvoiceLoading(false); }
    }, 400);
  };

  /* ── Products ── */
  const EMPTY_PROD = { name:'', description:'', bullet_points:'', price:'', category_id:'', stock_count:'0', featured:false, is_active:true, image_url:'' };
  const [prodForm, setProdForm]     = useState(EMPTY_PROD);
  const [prodImage, setProdImage]   = useState(null);
  const [editingProd, setEditingProd] = useState(null);

  const openAddProduct = () => { setEditingProd(null); setProdForm(EMPTY_PROD); setProdImage(null); setModal('product'); };
  const openEditProduct = (p) => {
    setEditingProd(p);
    setProdForm({ name:p.name, description:p.description||'', bullet_points:p.bullet_points||'', price:p.price??'', category_id:p.category_id||'', stock_count:p.stock_count||0, featured:p.featured===1, is_active:p.is_active!==0, image_url:p.image_url||'' });
    setProdImage(null);
    setModal('product');
  };

  const handleProdSubmit = async (e) => {
    e.preventDefault();
    if (!prodForm.name) { toast.error('Product name required'); return; }
    const fd = new FormData();
    Object.entries(prodForm).forEach(([k,v]) => fd.append(k, v instanceof Boolean ? (v?'1':'0') : v));
    fd.set('featured', prodForm.featured ? '1' : '0');
    fd.set('is_active', prodForm.is_active ? '1' : '0');
    if (prodImage) fd.append('image', prodImage);
    try {
      if (editingProd) { await productsApi.update(editingProd.id, fd); toast.success('Product updated!'); }
      else             { await productsApi.create(fd); toast.success('Product created!'); }
      setModal(null); setEditingProd(null);
      loadTab('products');
    } catch (err) { toast.error(err.message); }
  };

  const handleDeleteProd = (p) => {
    setConfirm({
      message: `Permanently delete "${p.name}"?`,
      sub: 'This will remove the product and all its stock from the database forever.',
      onConfirm: async () => {
        setConfirm(null);
        try {
          await productsApi.delete(p.id); // soft delete (hide)
          toast.success('Product removed');
          loadTab('products');
        } catch (err) { toast.error(err.message); }
      }
    });
  };

  /* ── Stock ── */
  const [stockForm, setStockForm] = useState({ product_id:'', items:'' });

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await stockApi.add(stockForm);
      toast.success(`Added ${res.added} items! Total stock: ${res.total_stock}`);
      setModal(null);
      setStockForm({ product_id:'', items:'' });
      loadTab('stock');
    } catch (err) { toast.error(err.message); }
  };

  const handleViewStock = async (pid) => {
    setStockPid(pid);
    if (!pid) { setStockItems([]); return; }
    setLoading(true);
    try { setStockItems(await stockApi.getByProduct(pid)); }
    catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const handleDeleteStockItem = (item) => {
    setConfirm({
      message: `Delete stock item "${item.content.slice(0,24)}..."?`,
      sub: 'This will permanently remove this digital item.',
      onConfirm: async () => {
        setConfirm(null);
        try {
          await stockApi.delete(item.id);
          toast.success('Stock item deleted');
          if (stockPid) handleViewStock(stockPid);
        } catch (err) { toast.error(err.message); }
      }
    });
  };

  /* ── Categories ── */
  const [catForm, setCatForm] = useState({ name:'', icon:'📦' });
  const handleCatSubmit = async (e) => {
    e.preventDefault();
    if (!catForm.name) { toast.error('Category name required'); return; }
    try {
      await categoriesApi.create(catForm);
      toast.success('Category created!');
      setModal(null); setCatForm({ name:'', icon:'📦' });
      loadTab('categories');
    } catch (err) { toast.error(err.message); }
  };

  const handleDeleteCat = (cat) => {
    setConfirm({
      message: `Delete category "${cat.name}"?`,
      sub: `${cat.product_count} product(s) will be moved to Uncategorized.`,
      onConfirm: async () => {
        setConfirm(null);
        try {
          await categoriesApi.delete(cat.id);
          toast.success('Category deleted — products moved to Uncategorized');
          loadTab('categories');
        } catch (err) { toast.error(err.message); }
      }
    });
  };

  /* ── Pricing ── */
  const [priceForm, setPriceForm]   = useState({ product_id:'', price:'' });
  const [priceSaving, setPriceSaving] = useState(false);

  const handleSetPrice = async (e) => {
    e.preventDefault();
    if (!priceForm.product_id) { toast.error('Select a product'); return; }
    setPriceSaving(true);
    try {
      await productsApi.update(priceForm.product_id, (() => { const fd=new FormData(); fd.append('price', priceForm.price); return fd; })());
      toast.success('Price updated!');
      setProducts(ps => ps.map(p => p.id === Number(priceForm.product_id) ? { ...p, price: parseFloat(priceForm.price) } : p));
    } catch (err) { toast.error(err.message); }
    finally { setPriceSaving(false); }
  };

  const handleClearPrice = (p) => {
    setConfirm({
      message: `Clear price for "${p.name}"?`,
      sub: 'The product will be marked as "Price Not Set" and Buy Now will be disabled.',
      onConfirm: async () => {
        setConfirm(null);
        try {
          const fd = new FormData(); fd.append('price', '');
          await productsApi.update(p.id, fd);
          toast.success('Price cleared');
          loadTab('pricing');
        } catch (err) { toast.error(err.message); }
      }
    });
  };

  /* ── Settings: LTC ── */
  const [ltcForm, setLtcForm] = useState({ address:'', label:'' });
  const handleLtcSubmit = async (e) => {
    e.preventDefault();
    if (!ltcForm.address) { toast.error('Address required'); return; }
    try {
      await ltcApi.add(ltcForm);
      toast.success('LTC address added!');
      setModal(null); setLtcForm({ address:'', label:'' });
      loadTab('settings');
    } catch (err) { toast.error(err.message); }
  };

  const handleActivateLtc = async (id) => {
    try { await ltcApi.activate(id); toast.success('Address activated!'); loadTab('settings'); }
    catch (err) { toast.error(err.message); }
  };

  const handleDeleteLtc = (addr) => {
    setConfirm({
      message: `Remove LTC address?`,
      sub: addr.address,
      onConfirm: async () => {
        setConfirm(null);
        try { await ltcApi.delete(addr.id); toast.success('Address removed'); loadTab('settings'); }
        catch (err) { toast.error(err.message); }
      }
    });
  };

  const handleDeleteReview = (r) => {
    setConfirm({
      message: `Delete review from "${r.customer_name}"?`,
      onConfirm: async () => {
        setConfirm(null);
        await reviewsApi.delete(r.id);
        setReviews(rs => rs.filter(x => x.id !== r.id));
        toast.success('Review deleted');
      }
    });
  };

  const filteredOrders = orderFilter ? orders.filter(o => o.payment_status === orderFilter) : orders;

  /* ─── RENDER ─── */
  return (
    <div className="min-h-screen flex relative">

      {/* Mobile overlay */}
      {sideOpen && <div className="fixed inset-0 bg-black/70 z-30 md:hidden" onClick={() => setSideOpen(false)}/>}

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 md:top-16 left-0 h-full md:h-[calc(100vh-64px)] w-56 flex-shrink-0 border-r border-white/5 bg-[#080808] flex flex-col z-40 transition-transform duration-300 ${sideOpen?'translate-x-0':'-translate-x-full md:translate-x-0'}`}>
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-neon-500/15 border border-neon-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-neon-500 font-bold text-xs">{adminEmail[0]?.toUpperCase()}</span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-medium truncate">{adminEmail}</p>
              <p className="text-neon-500 text-[10px]">Administrator</p>
            </div>
          </div>
          <button onClick={() => setSideOpen(false)} className="md:hidden text-gray-600 hover:text-white"><X size={15}/></button>
        </div>

        <nav className="flex-1 p-2.5 space-y-0.5 overflow-y-auto">
          {NAV.map(item => (
            <button key={item.id} onClick={() => { setTab(item.id); setSideOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === item.id ? 'bg-neon-500/12 text-neon-500 border border-neon-500/20' : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon size={15}/>
              {item.label}
              {tab === item.id && <ChevronRight size={13} className="ml-auto opacity-50"/>}
            </button>
          ))}
        </nav>

        <div className="p-2.5 border-t border-white/5">
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:text-red-400 hover:bg-red-400/5 transition-all">
            <LogOut size={15}/> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4 md:p-6 min-w-0 overflow-auto">

        {/* Mobile topbar */}
        <div className="flex items-center gap-3 mb-5 md:hidden">
          <button onClick={() => setSideOpen(true)} className="p-2 rounded-lg border border-white/10 text-gray-400"><Menu size={16}/></button>
          <span className="text-white font-semibold text-sm">{NAV.find(n=>n.id===tab)?.label}</span>
        </div>

        {loading ? <div className="flex justify-center py-20"><div className="spinner"/></div> : <>

        {/* ═══════════════ DASHBOARD ═══════════════ */}
        {tab === 'dashboard' && analytics && (
          <div>
            <h2 className="text-xl md:text-2xl font-display font-bold text-white mb-6 hidden md:block">
              Dashboard <span className="gold-text">Overview</span>
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <StatCard icon={DollarSign}  label="Total Revenue"  value={fmt(analytics.totalRevenue)}    sub="all confirmed orders" color="bg-neon-500"/>
              <StatCard icon={ShoppingBag} label="Confirmed"       value={analytics.totalOrders||0}       sub="paid orders"          color="bg-blue-400"/>
              <StatCard icon={Clock}       label="Pending"         value={analytics.pendingOrders||0}     sub="awaiting payment"     color="bg-yellow-400"/>
              <StatCard icon={TrendingUp}  label="Today"           value={fmt(analytics.todayRevenue)}    sub="revenue today"        color="bg-purple-400"/>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="glass-card p-5">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2 text-sm">
                  <ShoppingBag size={15} className="text-neon-500"/> Recent Orders
                </h3>
                {analytics.recentOrders?.length === 0
                  ? <p className="text-gray-600 text-sm text-center py-6">No orders yet</p>
                  : analytics.recentOrders?.map(o => (
                    <div key={o.id} className="flex items-center justify-between py-2.5 border-b border-white/4 last:border-0 gap-2">
                      <div className="min-w-0">
                        <p className="text-white text-xs font-medium truncate">{o.customer_email}</p>
                        <p className="text-gray-600 text-[11px]">{new Date(o.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-neon-500 text-sm font-bold">{fmt(o.total_amount)}</p>
                        <span className={`text-[10px] font-medium ${statusColor(o.payment_status)}`}>{o.payment_status}</span>
                      </div>
                    </div>
                  ))
                }
              </div>

              <div className="glass-card p-5">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2 text-sm">
                  <Package size={15} className="text-neon-500"/> Product Overview
                </h3>
                {products.slice(0,7).map(p => (
                  <div key={p.id} className="flex items-center justify-between py-2.5 border-b border-white/4 last:border-0 gap-2">
                    <p className="text-white text-xs truncate flex-1">{p.name}</p>
                    <div className="text-right flex-shrink-0">
                      <p className="text-neon-500 text-xs font-bold">{fmt(p.price)}</p>
                      <p className={`text-[10px] ${(p.available_stock??p.stock_count)>0?'text-green-400':'text-red-400'}`}>
                        {p.available_stock??p.stock_count} in stock
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {analytics.topProducts?.length > 0 && (
                <div className="glass-card p-5 lg:col-span-2">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2 text-sm">
                    <TrendingUp size={15} className="text-neon-500"/> Top Selling Products
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {analytics.topProducts.map((p,i) => (
                      <div key={i} className="bg-neon-500/5 border border-neon-500/10 rounded-xl p-3 text-center">
                        <p className="text-white text-xs font-medium truncate mb-1">{p.name}</p>
                        <p className="text-neon-500 font-bold text-sm">{p.order_count}</p>
                        <p className="text-gray-600 text-[10px]">sold</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════ PRODUCTS ═══════════════ */}
        {tab === 'products' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-display font-bold text-white">Manage <span className="gold-text">Products</span></h2>
              <button onClick={openAddProduct} className="btn-gold flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold">
                <Plus size={15}/> Add Product
              </button>
            </div>

            <div className="glass-card overflow-x-auto">
              <table className="w-full admin-table min-w-[580px]">
                <thead><tr>
                  <th className="text-left">Product</th>
                  <th className="text-left">Category</th>
                  <th className="text-left">Price</th>
                  <th className="text-left">Stock</th>
                  <th className="text-left">Status</th>
                  <th className="text-left">Actions</th>
                </tr></thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          {p.image_url && <img src={p.image_url} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" onError={e=>e.target.style.display='none'}/>}
                          <div>
                            <p className="text-white text-sm font-medium">{p.name}</p>
                            {p.featured===1 && <span className="text-neon-500 text-[10px]">★ Featured</span>}
                          </div>
                        </div>
                      </td>
                      <td><span className="text-gray-400 text-xs">{p.category_name||'Uncategorized'}</span></td>
                      <td>
                        {p.price != null
                          ? <span className="text-neon-500 font-bold text-sm">{fmt(p.price)}</span>
                          : <span className="text-gray-600 text-xs italic">Not set</span>
                        }
                      </td>
                      <td>
                        <span className={`text-sm font-medium ${(p.available_stock??p.stock_count)>0?'text-green-400':'text-red-400'}`}>
                          {p.available_stock??p.stock_count}
                        </span>
                      </td>
                      <td>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${p.is_active?'text-green-400 bg-green-400/10':'text-red-400 bg-red-400/10'}`}>
                          {p.is_active?'Active':'Hidden'}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-1.5">
                          <button onClick={()=>openEditProduct(p)} className="p-1.5 text-gray-500 hover:text-neon-500 transition-colors" title="Edit"><Edit size={13}/></button>
                          <button onClick={()=>handleDeleteProd(p)} className="p-1.5 text-gray-500 hover:text-red-400 transition-colors" title="Delete"><Trash2 size={13}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {products.length===0 && <tr><td colSpan={6}><EmptyState icon={Package} text="No products yet" sub="Click Add Product to get started"/></td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══════════════ STOCK ═══════════════ */}
        {tab === 'stock' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-display font-bold text-white">Digital <span className="gold-text">Stock</span></h2>
              <button onClick={() => { setStockForm({ product_id:'', items:'' }); setModal('stock'); }} className="btn-gold flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold">
                <Plus size={15}/> Add Stock
              </button>
            </div>

            {/* Quick overview cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-5">
              {products.slice(0,8).map(p => {
                const avail = p.available_stock ?? p.stock_count;
                return (
                  <button key={p.id} onClick={() => handleViewStock(String(p.id))}
                    className={`glass-card p-3 text-left hover:border-neon-500/30 transition-all ${stockPid===String(p.id)?'border-neon-500/40 bg-neon-500/5':''}`}
                  >
                    <p className="text-white text-xs font-medium truncate mb-1">{p.name}</p>
                    <p className={`text-xl font-bold font-mono ${avail>0?'text-neon-500':'text-red-400'}`}>{avail}</p>
                    <p className="text-gray-600 text-[10px]">available</p>
                  </button>
                );
              })}
            </div>

            {/* Product selector */}
            <div className="glass-card p-4 mb-4">
              <Select label="Select product to view stock items" value={stockPid} onChange={e=>handleViewStock(e.target.value)}>
                <option value="">Choose a product...</option>
                {products.map(p=><option key={p.id} value={p.id}>{p.name} ({p.available_stock??p.stock_count} available)</option>)}
              </Select>
            </div>

            {stockPid && (
              <div className="glass-card overflow-x-auto">
                <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium text-sm">{products.find(p=>String(p.id)===stockPid)?.name}</p>
                    <p className="text-gray-500 text-xs">{stockItems.length} total • {stockItems.filter(s=>!s.is_delivered).length} available • {stockItems.filter(s=>s.is_delivered).length} delivered</p>
                  </div>
                  <button onClick={()=>{ setStockForm({ product_id:stockPid, items:'' }); setModal('stock'); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-neon-500 border border-neon-500/30 hover:bg-neon-500/10 transition-all">
                    <Plus size={12}/> Add More
                  </button>
                </div>
                {stockItems.length === 0
                  ? <EmptyState icon={Layers} text="No stock items" sub="Add digital keys or items above"/>
                  : <table className="w-full admin-table min-w-[480px]">
                      <thead><tr>
                        <th className="text-left">Content / Key</th>
                        <th className="text-left">Status</th>
                        <th className="text-left">Added</th>
                        <th className="text-left">Action</th>
                      </tr></thead>
                      <tbody>
                        {stockItems.map(item => (
                          <tr key={item.id}>
                            <td><span className="font-mono text-xs text-gray-300">{item.content}</span></td>
                            <td>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${item.is_delivered?'text-gray-500 bg-gray-500/10':'text-green-400 bg-green-400/10'}`}>
                                {item.is_delivered?'Delivered':'Available'}
                              </span>
                            </td>
                            <td><span className="text-gray-500 text-xs">{new Date(item.created_at).toLocaleDateString()}</span></td>
                            <td>
                              {!item.is_delivered && (
                                <button onClick={()=>handleDeleteStockItem(item)} className="p-1.5 text-gray-600 hover:text-red-400 transition-colors"><Trash2 size={13}/></button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                }
              </div>
            )}
          </div>
        )}

        {/* ═══════════════ INVOICES ═══════════════ */}
        {tab === 'invoices' && (
          <div>
            <h2 className="text-xl font-display font-bold text-white mb-5">Search <span className="gold-text">Invoices</span></h2>

            {/* Search bar */}
            <div className="relative mb-6">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"/>
              <input
                type="text"
                value={invoiceQuery}
                onChange={e=>handleInvoiceSearch(e.target.value)}
                placeholder="Search by Order ID or customer email..."
                className="input-gold w-full pl-11 pr-4 py-3.5 text-sm"
              />
              {invoiceLoading && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-neon-500/30 border-t-neon-500 rounded-full animate-spin"/>}
            </div>

            {/* Results */}
            {invoiceQuery && !invoiceLoading && invoiceResults.length === 0 && (
              <EmptyState icon={FileText} text="No invoices found" sub={`No results for "${invoiceQuery}"`}/>
            )}

            {!invoiceQuery && (
              <div className="text-center py-16 text-gray-600">
                <Search size={40} className="mx-auto mb-3 opacity-20"/>
                <p className="text-sm text-gray-500">Enter an Order ID or email address to search</p>
                <p className="text-xs mt-1">e.g. "abc123..." or "customer@email.com"</p>
              </div>
            )}

            {invoiceResults.length > 0 && (
              <div className="space-y-2">
                {invoiceResults.map(order => (
                  <button key={order.id} onClick={() => setSelectedInvoice(order)}
                    className="w-full glass-card p-4 flex items-center justify-between gap-4 hover:border-neon-500/30 transition-all text-left"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-gray-400 font-mono text-xs">{order.id.slice(0,16)}...</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${statusBg(order.payment_status)}`}>{order.payment_status}</span>
                      </div>
                      <p className="text-white text-sm font-medium truncate">{order.customer_email}</p>
                      <p className="text-gray-500 text-xs">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-neon-500 font-bold text-lg">{fmt(order.total_amount)}</p>
                      <span className={`text-[10px] ${order.delivery_status==='delivered'?'text-green-400':'text-yellow-400'}`}>{order.delivery_status}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════ CATEGORIES ═══════════════ */}
        {tab === 'categories' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-display font-bold text-white">Manage <span className="gold-text">Categories</span></h2>
              <button onClick={() => { setCatForm({ name:'', icon:'📦' }); setModal('category'); }} className="btn-gold flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold">
                <Plus size={15}/> Add Category
              </button>
            </div>

            {categories.length === 0
              ? <EmptyState icon={Tag} text="No categories yet" sub="Create your first category"/>
              : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map(cat => (
                    <div key={cat.id} className="glass-card p-4 flex items-center justify-between hover:border-neon-500/25 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-neon-500/5 border border-neon-500/15 flex items-center justify-center text-2xl">{cat.icon}</div>
                        <div>
                          <p className="text-white font-semibold text-sm">{cat.name}</p>
                          <p className="text-gray-500 text-xs">{cat.product_count} product{cat.product_count!==1?'s':''}</p>
                        </div>
                      </div>
                      <button onClick={()=>handleDeleteCat(cat)} className="p-2 text-gray-600 hover:text-red-400 transition-colors rounded-lg hover:bg-red-400/5">
                        <Trash2 size={14}/>
                      </button>
                    </div>
                  ))}
                </div>
            }
          </div>
        )}

        {/* ═══════════════ PRICING ═══════════════ */}
        {tab === 'pricing' && (
          <div>
            <h2 className="text-xl font-display font-bold text-white mb-5">Manage <span className="gold-text">Pricing</span></h2>

            {/* Quick price set form */}
            <div className="glass-card p-5 mb-6">
              <h3 className="text-white font-semibold mb-4 text-sm flex items-center gap-2"><PriceIcon size={15} className="text-neon-500"/> Set Product Price</h3>
              <form onSubmit={handleSetPrice} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Select value={priceForm.product_id} onChange={e=>setPriceForm(f=>({ ...f, product_id:e.target.value }))}>
                    <option value="">Select product...</option>
                    {products.map(p=><option key={p.id} value={p.id}>{p.name} — {p.price!=null?fmt(p.price):'No price'}</option>)}
                  </Select>
                </div>
                <div className="sm:w-40">
                  <input type="number" step="0.01" min="0.01" value={priceForm.price} onChange={e=>setPriceForm(f=>({ ...f, price:e.target.value }))}
                    placeholder="New price $" className="input-gold w-full px-4 py-3 text-sm"/>
                </div>
                <button type="submit" disabled={priceSaving} className="btn-gold px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 flex-shrink-0">
                  {priceSaving ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"/> : <Check size={15}/>}
                  Set Price
                </button>
              </form>
            </div>

            {/* All products price table */}
            <div className="glass-card overflow-x-auto">
              <div className="px-4 py-3 border-b border-white/5">
                <p className="text-white font-semibold text-sm">All Product Prices</p>
                <p className="text-gray-500 text-xs">Products without a price are disabled for purchase</p>
              </div>
              <table className="w-full admin-table min-w-[480px]">
                <thead><tr>
                  <th className="text-left">Product</th>
                  <th className="text-left">Category</th>
                  <th className="text-left">Current Price</th>
                  <th className="text-left">Stock</th>
                  <th className="text-left">Actions</th>
                </tr></thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td><p className="text-white text-sm font-medium">{p.name}</p></td>
                      <td><span className="text-gray-500 text-xs">{p.category_name||'Uncategorized'}</span></td>
                      <td>
                        {p.price != null
                          ? <span className="text-neon-500 font-bold font-mono">{fmt(p.price)}</span>
                          : <span className="text-xs px-2 py-0.5 rounded-full text-red-400 bg-red-400/10 border border-red-400/20">Not set</span>
                        }
                      </td>
                      <td><span className={`text-sm font-medium ${(p.available_stock??p.stock_count)>0?'text-green-400':'text-red-400'}`}>{p.available_stock??p.stock_count}</span></td>
                      <td>
                        <div className="flex gap-2 items-center">
                          <button
                            onClick={()=>{ setPriceForm({ product_id:String(p.id), price:p.price??'' }); }}
                            className="text-xs px-2.5 py-1 rounded-lg text-neon-500 border border-neon-500/25 hover:bg-neon-500/10 transition-all"
                          >
                            Edit
                          </button>
                          {p.price != null && (
                            <button onClick={()=>handleClearPrice(p)} className="text-xs px-2.5 py-1 rounded-lg text-red-400 border border-red-400/25 hover:bg-red-400/10 transition-all">
                              Clear
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {products.length===0 && <tr><td colSpan={5}><EmptyState icon={PriceIcon} text="No products found"/></td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══════════════ SETTINGS ═══════════════ */}
        {tab === 'settings' && (
          <div className="space-y-8">
            <h2 className="text-xl font-display font-bold text-white hidden md:block">Store <span className="gold-text">Settings</span></h2>

            {/* LTC Addresses */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white font-semibold flex items-center gap-2"><Bitcoin size={16} className="text-neon-500"/> LTC Payment Addresses</h3>
                  <p className="text-gray-500 text-xs mt-0.5">The active address is shown on all payment invoices</p>
                </div>
                <button onClick={()=>{ setLtcForm({ address:'', label:'' }); setModal('ltc'); }} className="btn-gold flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold">
                  <Plus size={13}/> Add Address
                </button>
              </div>

              {ltcAddresses.length === 0
                ? <EmptyState icon={Bitcoin} text="No LTC addresses" sub="Add your first wallet address to accept crypto payments"/>
                : <div className="space-y-2">
                    {ltcAddresses.map(addr => (
                      <div key={addr.id} className={`glass-card p-4 flex items-center gap-4 justify-between ${addr.is_active?'border-neon-500/25':''}`}>
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${addr.is_active?'bg-neon-500 shadow-[0_0_8px_rgba(0,255,65,0.6)]':'bg-gray-700'}`}/>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-white text-sm font-medium">{addr.label||'Unnamed'}</p>
                              {addr.is_active && <span className="text-[10px] px-2 py-0.5 rounded-full bg-neon-500/10 text-neon-500 border border-neon-500/20">ACTIVE</span>}
                            </div>
                            <p className="text-gray-500 text-xs font-mono truncate">{addr.address}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          {!addr.is_active && (
                            <button onClick={()=>handleActivateLtc(addr.id)} className="px-3 py-1.5 rounded-lg text-xs text-neon-500 border border-neon-500/30 hover:bg-neon-500/10 transition-all">Activate</button>
                          )}
                          <button onClick={()=>handleDeleteLtc(addr)} className="p-1.5 text-gray-600 hover:text-red-400 transition-colors"><Trash2 size={14}/></button>
                        </div>
                      </div>
                    ))}
                  </div>
              }
            </div>

            <div className="green-divider"/>

            {/* Reviews */}
            <div>
              <h3 className="text-white font-semibold flex items-center gap-2 mb-4"><Star size={16} className="text-neon-500"/> Customer Reviews</h3>
              {reviews.length === 0
                ? <EmptyState icon={Star} text="No reviews" sub="Customer reviews will appear here"/>
                : <div className="space-y-2">
                    {reviews.map(r => (
                      <div key={r.id} className="glass-card p-4 flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-neon-500/10 flex items-center justify-center text-neon-500 font-bold text-xs flex-shrink-0">{r.customer_name[0].toUpperCase()}</div>
                          <div>
                            <p className="text-white text-sm font-medium">{r.customer_name}</p>
                            <div className="flex gap-0.5 mb-1">{[...Array(r.rating)].map((_,i)=><span key={i} className="text-yellow-400 text-xs">★</span>)}</div>
                            <p className="text-gray-400 text-sm">{r.comment}</p>
                          </div>
                        </div>
                        <button onClick={()=>handleDeleteReview(r)} className="p-1.5 text-gray-600 hover:text-red-400 transition-colors flex-shrink-0"><Trash2 size={13}/></button>
                      </div>
                    ))}
                  </div>
              }
            </div>
          </div>
        )}

        </>}
      </main>

      {/* ═══════════════ MODALS ═══════════════ */}
      <AnimatePresence>

        {/* Add / Edit Product */}
        {modal === 'product' && (
          <Modal title={editingProd ? 'Edit Product' : 'Add New Product'} onClose={()=>{ setModal(null); setEditingProd(null); }} wide>
            <form onSubmit={handleProdSubmit} className="space-y-4">
              <Input label="Product Name *" type="text" value={prodForm.name} onChange={e=>setProdForm(p=>({...p,name:e.target.value}))} placeholder="e.g. Netflix Premium 1 Month" required/>
              <Textarea label="Short Description" value={prodForm.description} onChange={e=>setProdForm(p=>({...p,description:e.target.value}))} rows={2} placeholder="Brief overview of the product..."/>
              <Textarea label="Feature Bullets (one per line)" value={prodForm.bullet_points} onChange={e=>setProdForm(p=>({...p,bullet_points:e.target.value}))} rows={5} placeholder={"• Ultra HD 4K streaming\n• 4 simultaneous screens\n• No ads, cancel anytime"}/>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Price (USD)" type="number" step="0.01" min="0.01" value={prodForm.price} onChange={e=>setProdForm(p=>({...p,price:e.target.value}))} placeholder="9.99"/>
                <Input label="Stock Count" type="number" min="0" value={prodForm.stock_count} onChange={e=>setProdForm(p=>({...p,stock_count:e.target.value}))}/>
              </div>
              <Select label="Category" value={prodForm.category_id} onChange={e=>setProdForm(p=>({...p,category_id:e.target.value}))}>
                <option value="">Uncategorized</option>
                {categories.map(c=><option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </Select>
              <Input label="Image URL" type="url" value={prodForm.image_url} onChange={e=>setProdForm(p=>({...p,image_url:e.target.value}))} placeholder="https://example.com/product.jpg"/>
              <div>
                <label className="text-gray-400 text-sm mb-1.5 block">Or Upload Image File</label>
                <input type="file" accept="image/*" onChange={e=>setProdImage(e.target.files?.[0])} className="input-gold w-full px-4 py-2.5 text-sm"/>
              </div>
              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={prodForm.featured} onChange={e=>setProdForm(p=>({...p,featured:e.target.checked}))} className="w-4 h-4 accent-green-400"/>
                  <span className="text-gray-300 text-sm">Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={prodForm.is_active} onChange={e=>setProdForm(p=>({...p,is_active:e.target.checked}))} className="w-4 h-4 accent-green-400"/>
                  <span className="text-gray-300 text-sm">Active (visible)</span>
                </label>
              </div>
              <button type="submit" className="btn-gold w-full py-3 rounded-xl font-bold mt-2">
                {editingProd ? 'Update Product' : 'Create Product'}
              </button>
            </form>
          </Modal>
        )}

        {/* Add Stock */}
        {modal === 'stock' && (
          <Modal title="Add Digital Stock" onClose={()=>setModal(null)}>
            <form onSubmit={handleStockSubmit} className="space-y-4">
              <Select label="Product *" value={stockForm.product_id} onChange={e=>setStockForm(p=>({...p,product_id:e.target.value}))} required>
                <option value="">Select product...</option>
                {products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
              </Select>
              <Textarea
                label="License Keys / Digital Items (one per line)"
                value={stockForm.items}
                onChange={e=>setStockForm(p=>({...p,items:e.target.value}))}
                rows={9}
                placeholder={"KEY-XXXX-YYYY-ZZZZ\nKEY-AAAA-BBBB-CCCC\nKEY-1111-2222-3333"}
                required
              />
              <p className="text-gray-600 text-xs -mt-2">Each line = one digital item delivered to a customer</p>
              <button type="submit" className="btn-gold w-full py-3 rounded-xl font-bold">Add to Stock</button>
            </form>
          </Modal>
        )}

        {/* Add Category */}
        {modal === 'category' && (
          <Modal title="Add New Category" onClose={()=>setModal(null)}>
            <form onSubmit={handleCatSubmit} className="space-y-4">
              <Input label="Category Name *" type="text" value={catForm.name} onChange={e=>setCatForm(p=>({...p,name:e.target.value}))} placeholder="e.g. Gaming" required/>
              <div>
                <label className="text-gray-400 text-sm mb-1.5 block">Icon (emoji)</label>
                <div className="flex gap-2">
                  <input type="text" value={catForm.icon} onChange={e=>setCatForm(p=>({...p,icon:e.target.value}))} placeholder="📦" className="input-gold w-24 px-4 py-3 text-center text-2xl"/>
                  <div className="flex flex-wrap gap-2 flex-1">
                    {['🎮','📺','🔧','📱','🔒','👤','💻','🎵','🎬','🛡️','⚡','🌟'].map(e=>(
                      <button key={e} type="button" onClick={()=>setCatForm(p=>({...p,icon:e}))}
                        className={`w-9 h-9 rounded-lg text-xl flex items-center justify-center transition-all ${catForm.icon===e?'bg-neon-500/20 border border-neon-500/40':'bg-white/5 hover:bg-white/10'}`}
                      >{e}</button>
                    ))}
                  </div>
                </div>
              </div>
              <button type="submit" className="btn-gold w-full py-3 rounded-xl font-bold">Create Category</button>
            </form>
          </Modal>
        )}

        {/* Add LTC Address */}
        {modal === 'ltc' && (
          <Modal title="Add LTC Address" onClose={()=>setModal(null)}>
            <form onSubmit={handleLtcSubmit} className="space-y-4">
              <div className="p-3 bg-yellow-400/5 border border-yellow-400/20 rounded-lg text-xs text-gray-400 flex gap-2">
                <AlertTriangle size={14} className="text-yellow-400 flex-shrink-0 mt-0.5"/>
                <p>Only add your public <strong className="text-white">wallet receive address</strong>. Never enter private keys or seed phrases.</p>
              </div>
              <Input label="LTC Wallet Address *" type="text" value={ltcForm.address} onChange={e=>setLtcForm(p=>({...p,address:e.target.value}))} placeholder="ltc1q... or Lxxxxxxx..." required/>
              <Input label="Label (optional)" type="text" value={ltcForm.label} onChange={e=>setLtcForm(p=>({...p,label:e.target.value}))} placeholder="e.g. Main Wallet"/>
              <button type="submit" className="btn-gold w-full py-3 rounded-xl font-bold">Add Address</button>
            </form>
          </Modal>
        )}

        {/* Invoice detail modal */}
        {selectedInvoice && (
          <Modal title="Invoice Details" onClose={()=>setSelectedInvoice(null)} wide>
            <div className="space-y-4">
              {/* Status banner */}
              <div className={`p-3 rounded-xl border text-sm font-semibold flex items-center gap-2 ${statusBg(selectedInvoice.payment_status)}`}>
                <CreditCard size={16}/>
                Payment: {selectedInvoice.payment_status?.toUpperCase()}
                <span className="ml-auto font-normal text-xs opacity-70">{selectedInvoice.delivery_status}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: FileText,  label:'Order ID',       value: selectedInvoice.id },
                  { icon: Mail,      label:'Customer Email', value: selectedInvoice.customer_email },
                  { icon: DollarSign,label:'Total Amount',   value: fmt(selectedInvoice.total_amount) },
                  { icon: Calendar,  label:'Created',        value: new Date(selectedInvoice.created_at).toLocaleString() },
                  { icon: Bitcoin,   label:'LTC Address',    value: selectedInvoice.payment_address || '—' },
                  { icon: CreditCard,label:'LTC Amount',     value: selectedInvoice.payment_amount ? `${selectedInvoice.payment_amount} LTC` : '—' },
                ].map(({icon:Icon, label, value}) => (
                  <div key={label} className="bg-black/30 border border-white/5 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon size={12} className="text-neon-500"/>
                      <span className="text-gray-500 text-[11px] uppercase tracking-wider">{label}</span>
                    </div>
                    <p className="text-white text-sm font-medium font-mono break-all">{value}</p>
                  </div>
                ))}
              </div>

              {/* Items */}
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Order Items</p>
                <div className="space-y-2">
                  {(Array.isArray(selectedInvoice.items) ? selectedInvoice.items : []).map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-black/20 border border-white/5 rounded-xl">
                      <div>
                        <p className="text-white text-sm font-medium">{item.name}</p>
                        <p className="text-gray-500 text-xs">Qty: {item.quantity} × {fmt(item.price)}</p>
                      </div>
                      <p className="text-neon-500 font-bold">{fmt((item.price||0) * (item.quantity||1))}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => { navigator.clipboard.writeText(selectedInvoice.id); toast.success('Order ID copied!'); }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm text-gray-400 border border-white/10 hover:border-neon-500/30 hover:text-neon-500 transition-all"
              >
                <Copy size={14}/> Copy Order ID
              </button>
            </div>
          </Modal>
        )}

      </AnimatePresence>

      {/* Confirm popup */}
      {confirm && <ConfirmModal message={confirm.message} sub={confirm.sub} onConfirm={confirm.onConfirm} onCancel={()=>setConfirm(null)}/>}
    </div>
  );
}

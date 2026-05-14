import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, Tag, FileText, Star, LogOut, Plus, Trash2, Edit,
  TrendingUp, DollarSign, Clock, X, RefreshCw, Bitcoin, AlertTriangle, Layers,
  Search, Settings, ChevronRight, Check, Eye, Menu, Copy, Save, Key, Globe, Image as ImageIcon
} from 'lucide-react';
import { productsApi, categoriesApi, ordersApi, reviewsApi, stockApi, ltcApi, settingsApi } from '../lib/api';
import { useStore } from '../lib/StoreContext';
import { fmtLTC } from '../lib/utils';
import { useLocation } from 'wouter';
import toast from 'react-hot-toast';

const NAV = [
  { id: 'dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { id: 'products',  label: 'Products',   icon: Package },
  { id: 'stock',     label: 'Stock',      icon: Layers },
  { id: 'invoices',  label: 'Invoices',   icon: FileText },
  { id: 'categories',label: 'Categories', icon: Tag },
  { id: 'pricing',   label: 'Pricing',    icon: DollarSign },
  { id: 'settings',  label: 'Settings',   icon: Settings },
];

const statusColor = (s: string) => ({ confirmed:'text-green-400', pending:'text-yellow-400', failed:'text-red-400', expired:'text-gray-500', confirming:'text-blue-400' }[s] || 'text-gray-400');
const statusBg    = (s: string) => ({ confirmed:'status-confirmed', pending:'status-pending', failed:'status-failed', expired:'status-expired', confirming:'status-confirming' }[s] || '');
const fmt = (n: any) => n != null ? `$${Number(n).toFixed(2)}` : '—';

function StatCard({ icon: Icon, label, value, sub, color = 'bg-neon-500' }: any) {
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

function Modal({ title, onClose, wide, children }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <motion.div initial={{ opacity:0, scale:0.92 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.92 }}
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

function ConfirmModal({ message, sub, onConfirm, onCancel }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} className="glass-card p-6 w-full max-w-sm">
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

function Input({ label, ...props }: any) {
  return (
    <div>
      {label && <label className="text-gray-400 text-sm mb-1.5 block">{label}</label>}
      <input className="input-gold w-full px-4 py-3 text-sm" {...props}/>
    </div>
  );
}

function Textarea({ label, ...props }: any) {
  return (
    <div>
      {label && <label className="text-gray-400 text-sm mb-1.5 block">{label}</label>}
      <textarea className="input-gold w-full px-4 py-3 text-sm resize-none" {...props}/>
    </div>
  );
}

function Select({ label, children, ...props }: any) {
  return (
    <div>
      {label && <label className="text-gray-400 text-sm mb-1.5 block">{label}</label>}
      <select className="input-gold w-full px-4 py-3 text-sm bg-transparent" {...props}>{children}</select>
    </div>
  );
}

function PriceInput({ label = 'Price (USD)', value, onChange, placeholder = '0.00' }: { label?: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  const parsed = value !== '' ? parseFloat(value) : NaN;
  const isValid = value !== '' && !isNaN(parsed) && parsed >= 0;
  const preview = isValid ? fmtLTC(parsed) : null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/^\$+/, '').replace(/[^0-9.]/g, '');
    const parts = v.split('.');
    if (parts.length > 2) return;
    if (parts[1] !== undefined && parts[1].length > 8) return;
    onChange(v);
  };

  return (
    <div>
      <label className="text-gray-400 text-sm mb-1.5 block">{label}</label>
      <div
        className="relative flex items-center rounded-xl overflow-hidden transition-all duration-200"
        style={{
          background: 'linear-gradient(135deg, rgba(0,255,65,0.04) 0%, rgba(0,0,0,0.6) 100%)',
          border: isValid ? '1px solid rgba(0,255,65,0.4)' : '1px solid rgba(0,255,65,0.12)',
          boxShadow: isValid ? '0 0 18px rgba(0,255,65,0.08), inset 0 0 12px rgba(0,255,65,0.03)' : 'none',
        }}
      >
        <div className="flex items-center justify-center pl-4 pr-2 border-r border-neon-500/20 select-none"
          style={{ minWidth: 36, height: 48 }}>
          <span className="text-neon-500 font-bold font-mono text-lg leading-none" style={{ textShadow: isValid ? '0 0 12px rgba(0,255,65,0.8)' : 'none' }}>$</span>
        </div>
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-white font-mono text-base px-3 py-3 outline-none placeholder-gray-700"
          style={{ letterSpacing: '0.06em' }}
        />
        <div
          className="flex items-center gap-1 pr-4 pl-2 border-l border-neon-500/20 select-none"
          style={{ height: 48 }}
        >
          <span
            className="font-bold font-mono text-xs tracking-widest transition-all duration-300"
            style={{ color: isValid ? 'rgba(0,255,65,0.9)' : 'rgba(255,255,255,0.12)', textShadow: isValid ? '0 0 10px rgba(0,255,65,0.6)' : 'none' }}
          >LTC</span>
        </div>
      </div>
      <div className="mt-1.5 h-5">
        {preview ? (
          <p className="text-xs font-mono flex items-center gap-1.5">
            <span className="text-gray-600">→ Storefront:</span>
            <span className="text-neon-500 font-bold" style={{ textShadow: '0 0 8px rgba(0,255,65,0.5)' }}>{preview}</span>
          </p>
        ) : value && !isValid ? (
          <p className="text-xs text-red-400/70">Enter a valid number (e.g. 0.5, 9.99, 19)</p>
        ) : null}
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, text, sub }: any) {
  return (
    <div className="text-center py-16 text-gray-600">
      <Icon size={36} className="mx-auto mb-3 opacity-25"/>
      <p className="text-sm font-medium text-gray-500">{text}</p>
      {sub && <p className="text-xs mt-1">{sub}</p>}
    </div>
  );
}

function SettingsSection({ title, icon: Icon, children }: any) {
  return (
    <div className="glass-card p-5 md:p-6">
      <div className="flex items-center gap-2 mb-5 pb-4 border-b border-white/5">
        <div className="w-8 h-8 rounded-lg bg-neon-500/10 flex items-center justify-center">
          <Icon size={15} className="text-neon-500" />
        </div>
        <h3 className="text-white font-semibold text-sm">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function AdminDashboard() {
  const [tab, setTab]               = useState('dashboard');
  const [analytics, setAnalytics]   = useState<any>(null);
  const [products, setProducts]     = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [orders, setOrders]         = useState<any[]>([]);
  const [reviews, setReviews]       = useState<any[]>([]);
  const [ltcAddresses, setLtc]      = useState<any[]>([]);
  const [stockItems, setStockItems] = useState<any[]>([]);
  const [stockPid, setStockPid]     = useState('');
  const [loading, setLoading]       = useState(false);
  const [modal, setModal]           = useState<string|null>(null);
  const [confirm, setConfirm]       = useState<any>(null);
  const [sideOpen, setSideOpen]     = useState(false);
  const [invoiceQuery, setInvoiceQuery] = useState('');
  const [invoiceResults, setInvoiceResults] = useState<any[]>([]);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const searchTimeout = useRef<any>(null);
  const adminEmail = localStorage.getItem('admin_email') || 'admin';
  const [, navigate] = useLocation();
  const { settings: storeSettings, refresh: refreshStore } = useStore();

  const [storeForm, setStoreForm]     = useState({ store_name: '', logo_url: '', store_tagline: '' });
  const [storeSaving, setStoreSaving] = useState(false);
  const [pwForm, setPwForm]           = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [pwSaving, setPwSaving]       = useState(false);

  useEffect(() => {
    if (tab === 'settings') {
      setStoreForm({
        store_name:    storeSettings.store_name || '',
        logo_url:      storeSettings.logo_url   || '',
        store_tagline: storeSettings.store_tagline || '',
      });
    }
  }, [tab, storeSettings]);

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_email');
    navigate('/');
    toast.success('Logged out');
  };

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) { navigate('/admin/login'); return; }
    loadTab(tab);
  }, [tab]);

  const loadTab = async (t: string) => {
    setLoading(true);
    try {
      if (t === 'dashboard') {
        const [anal, prods, cats]: any = await Promise.all([ordersApi.getAnalytics(), productsApi.getAll({}), categoriesApi.getAll()]);
        setAnalytics(anal); setProducts(prods || []); setCategories(cats || []);
      } else if (t === 'products') {
        const [prods, cats]: any = await Promise.all([productsApi.getAll({}), categoriesApi.getAll()]);
        setProducts(prods || []); setCategories(cats || []);
      } else if (t === 'categories') {
        setCategories((await categoriesApi.getAll() as any) || []);
      } else if (t === 'orders') {
        const res: any = await ordersApi.getAll({});
        setOrders(res.orders || []);
      } else if (t === 'stock') {
        setProducts((await productsApi.getAll({}) as any) || []);
        if (stockPid) setStockItems((await stockApi.getByProduct(stockPid) as any) || []);
      } else if (t === 'invoices') {
        setInvoiceResults([]);
      } else if (t === 'pricing') {
        setProducts((await productsApi.getAll({}) as any) || []);
      } else if (t === 'settings') {
        const [ltc, revs]: any = await Promise.all([ltcApi.getAll(), reviewsApi.getAll()]);
        setLtc(ltc || []); setReviews(revs || []);
      }
    } catch (err: any) {
      if (err.message?.includes('401') || err.message?.includes('Invalid token')) logout();
    } finally { setLoading(false); }
  };

  const handleInvoiceSearch = (q: string) => {
    setInvoiceQuery(q);
    clearTimeout(searchTimeout.current);
    if (!q.trim()) { setInvoiceResults([]); return; }
    searchTimeout.current = setTimeout(async () => {
      setInvoiceLoading(true);
      try {
        const res: any = await ordersApi.search(q.trim());
        setInvoiceResults(res || []);
      } catch { toast.error('Search failed'); }
      finally { setInvoiceLoading(false); }
    }, 400);
  };

  const EMPTY_PROD: any = { name:'', description:'', bullet_points:'', price:'', category_id:'', stock_count:'0', featured:false, is_active:true, image_url:'' };
  const [prodForm, setProdForm]       = useState<any>(EMPTY_PROD);
  const [prodImage, setProdImage]     = useState<any>(null);
  const [editingProd, setEditingProd] = useState<any>(null);

  const openAddProduct = () => { setEditingProd(null); setProdForm(EMPTY_PROD); setProdImage(null); setModal('product'); };
  const openEditProduct = (p: any) => {
    setEditingProd(p);
    setProdForm({ name:p.name, description:p.description||'', bullet_points:p.bullet_points||'', price:p.price??'', category_id:p.category_id||'', stock_count:p.stock_count||0, featured:p.featured===1, is_active:p.is_active!==0, image_url:p.image_url||'' });
    setProdImage(null);
    setModal('product');
  };

  const handleProdSubmit = async (e: any) => {
    e.preventDefault();
    if (!prodForm.name) { toast.error('Product name required'); return; }
    const fd = new FormData();
    Object.entries(prodForm).forEach(([k,v]: any) => fd.append(k, v));
    fd.set('featured', prodForm.featured ? '1' : '0');
    fd.set('is_active', prodForm.is_active ? '1' : '0');
    if (prodImage) fd.append('image', prodImage);
    try {
      if (editingProd) { await productsApi.update(editingProd.id, fd); toast.success('Product updated!'); }
      else             { await productsApi.create(fd); toast.success('Product created!'); }
      setModal(null); setEditingProd(null);
      loadTab('products');
    } catch (err: any) { toast.error(err.message); }
  };

  const handleDeleteProd = (p: any) => {
    setConfirm({
      message: `Permanently delete "${p.name}"?`,
      sub: 'This will remove the product and all its stock from the database forever.',
      onConfirm: async () => {
        setConfirm(null);
        try {
          await productsApi.delete(p.id);
          toast.success('Product removed');
          loadTab('products');
        } catch (err: any) { toast.error(err.message); }
      }
    });
  };

  const [stockForm, setStockForm] = useState({ product_id:'', items:'' });
  const handleStockSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const res: any = await stockApi.add(stockForm);
      toast.success(`Added ${res.added} items! Total stock: ${res.total_stock}`);
      setModal(null); setStockForm({ product_id:'', items:'' });
      loadTab('stock');
    } catch (err: any) { toast.error(err.message); }
  };

  const handleViewStock = async (pid: string) => {
    setStockPid(pid);
    if (!pid) { setStockItems([]); return; }
    setLoading(true);
    try { setStockItems((await stockApi.getByProduct(pid) as any) || []); }
    catch (err: any) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const handleDeleteStockItem = (item: any) => {
    setConfirm({
      message: `Delete stock item?`,
      sub: 'This will permanently remove this digital item.',
      onConfirm: async () => {
        setConfirm(null);
        try {
          await stockApi.delete(item.id);
          toast.success('Stock item deleted');
          if (stockPid) handleViewStock(stockPid);
        } catch (err: any) { toast.error(err.message); }
      }
    });
  };

  const [catForm, setCatForm] = useState({ name:'', icon:'📦' });
  const handleCatSubmit = async (e: any) => {
    e.preventDefault();
    if (!catForm.name) { toast.error('Category name required'); return; }
    try {
      await categoriesApi.create(catForm);
      toast.success('Category created!');
      setModal(null); setCatForm({ name:'', icon:'📦' });
      loadTab('categories');
    } catch (err: any) { toast.error(err.message); }
  };
  const handleDeleteCat = (cat: any) => {
    setConfirm({
      message: `Delete category "${cat.name}"?`,
      sub: 'Products in this category will become uncategorized.',
      onConfirm: async () => {
        setConfirm(null);
        try {
          await categoriesApi.delete(cat.id);
          toast.success('Category deleted');
          loadTab('categories');
        } catch (err: any) { toast.error(err.message); }
      }
    });
  };

  const [priceForm, setPriceForm]   = useState({ product_id:'', price:'' });
  const [priceSaving, setPriceSaving] = useState(false);
  const handleSetPrice = async (e: any) => {
    e.preventDefault();
    if (!priceForm.product_id || !priceForm.price) { toast.error('Select product and set price'); return; }
    setPriceSaving(true);
    try {
      const fd = new FormData();
      fd.append('price', priceForm.price);
      await productsApi.update(parseInt(priceForm.product_id), fd);
      toast.success('Price updated!');
      loadTab('pricing');
    } catch (err: any) { toast.error(err.message); }
    finally { setPriceSaving(false); }
  };
  const handleClearPrice = (p: any) => {
    setConfirm({
      message: `Clear price for "${p.name}"?`,
      sub: 'This product will no longer be purchasable.',
      onConfirm: async () => {
        setConfirm(null);
        const fd = new FormData(); fd.append('price', '');
        try { await productsApi.update(p.id, fd); toast.success('Price cleared'); loadTab('pricing'); }
        catch (err: any) { toast.error(err.message); }
      }
    });
  };

  const [ltcForm, setLtcForm] = useState({ address:'', label:'' });
  const handleLtcSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await ltcApi.add(ltcForm);
      toast.success('Address added!');
      setModal(null); setLtcForm({ address:'', label:'' });
      loadTab('settings');
    } catch (err: any) { toast.error(err.message); }
  };
  const handleActivateLtc = async (id: number) => {
    try { await ltcApi.activate(id); toast.success('Address activated!'); loadTab('settings'); }
    catch (err: any) { toast.error(err.message); }
  };
  const handleDeleteLtc = (addr: any) => {
    setConfirm({
      message: `Delete address "${addr.label || addr.address.slice(0,20)}"?`,
      onConfirm: async () => {
        setConfirm(null);
        try { await ltcApi.delete(addr.id); toast.success('Address deleted'); loadTab('settings'); }
        catch (err: any) { toast.error(err.message); }
      }
    });
  };
  const handleDeleteReview = (r: any) => {
    setConfirm({
      message: `Delete review by "${r.customer_name}"?`,
      onConfirm: async () => {
        setConfirm(null);
        try { await reviewsApi.delete(r.id); toast.success('Review deleted'); loadTab('settings'); }
        catch (err: any) { toast.error(err.message); }
      }
    });
  };

  const handleStoreSave = async (e: any) => {
    e.preventDefault();
    setStoreSaving(true);
    try {
      await settingsApi.update(storeForm);
      await refreshStore();
      toast.success('Store settings saved!');
    } catch (err: any) { toast.error(err.message); }
    finally { setStoreSaving(false); }
  };

  const handlePasswordChange = async (e: any) => {
    e.preventDefault();
    if (!pwForm.current_password || !pwForm.new_password) { toast.error('All fields required'); return; }
    if (pwForm.new_password !== pwForm.confirm_password) { toast.error('Passwords do not match'); return; }
    if (pwForm.new_password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setPwSaving(true);
    try {
      await settingsApi.changePassword({ current_password: pwForm.current_password, new_password: pwForm.new_password });
      toast.success('Password changed! Please log in again.');
      setPwForm({ current_password:'', new_password:'', confirm_password:'' });
      setTimeout(() => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_email');
        navigate('/admin/login');
      }, 1500);
    } catch (err: any) { toast.error(err.message); }
    finally { setPwSaving(false); }
  };

  return (
    <div className="min-h-screen flex bg-[#050505]">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-56 bg-[#070707] border-r border-neon-500/10 flex flex-col transition-transform duration-300 ${sideOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-5 border-b border-neon-500/10">
          <div className="flex items-center gap-2">
            {storeSettings.logo_url ? (
              <img src={storeSettings.logo_url} alt="logo" className="w-6 h-6 object-contain rounded" />
            ) : (
              <span className="text-xl">🌌</span>
            )}
            <div>
              <p className="text-neon-500 font-mono text-xs font-bold tracking-wider">ADMIN</p>
              <p className="text-gray-600 text-[10px] truncate">{adminEmail}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => { setTab(id); setSideOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${tab===id ? 'bg-neon-500/10 text-neon-500 border border-neon-500/20' : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'}`}
            >
              <Icon size={15}/> {label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-neon-500/10">
          <button onClick={() => navigate('/')} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-gray-500 hover:text-gray-200 hover:bg-white/5 transition-all mb-1">
            <ChevronRight size={13} className="rotate-180"/> Back to Store
          </button>
          <button onClick={logout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-red-500/70 hover:text-red-400 hover:bg-red-500/5 transition-all">
            <LogOut size={13}/> Logout
          </button>
        </div>
      </aside>

      {sideOpen && <div className="fixed inset-0 z-30 bg-black/60 md:hidden" onClick={() => setSideOpen(false)}/>}

      {/* Main */}
      <main className="flex-1 md:ml-56 min-h-screen">
        <div className="sticky top-0 z-20 bg-[#070707]/90 backdrop-blur border-b border-neon-500/10 px-4 md:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSideOpen(!sideOpen)} className="md:hidden p-1.5 text-gray-500 hover:text-neon-500 transition-colors border border-white/10 rounded">
              <Menu size={16}/>
            </button>
            <h2 className="text-white font-display font-bold capitalize text-lg hidden sm:block">{tab}</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neon-500/5 border border-neon-500/15">
              <div className="w-1.5 h-1.5 bg-neon-500 rounded-full animate-pulse"/>
              <span className="text-neon-500 text-xs font-mono hidden sm:inline">LIVE</span>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 max-w-6xl mx-auto">
          {loading && !analytics && (
            <div className="flex justify-center py-20"><div className="spinner"/></div>
          )}

          {!loading || analytics || products.length > 0 ? <>

          {/* DASHBOARD */}
          {tab === 'dashboard' && analytics && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={DollarSign} label="Total Revenue" value={fmt(analytics.totalRevenue)} sub="All time" color="bg-neon-500"/>
                <StatCard icon={TrendingUp} label="Total Orders" value={analytics.totalOrders} sub="Confirmed" color="bg-neon-500"/>
                <StatCard icon={Clock} label="Pending Orders" value={analytics.pendingOrders} sub="Awaiting payment" color="bg-yellow-400"/>
                <StatCard icon={DollarSign} label="Today Revenue" value={fmt(analytics.todayRevenue)} sub="Today" color="bg-neon-500"/>
              </div>

              {analytics.recentOrders?.length > 0 && (
                <div className="glass-card overflow-x-auto">
                  <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                    <p className="text-white font-semibold text-sm">Recent Orders</p>
                    <button onClick={() => setTab('invoices')} className="text-neon-500 text-xs hover:underline">View all</button>
                  </div>
                  <table className="w-full admin-table min-w-[480px]">
                    <thead><tr><th className="text-left">Order ID</th><th className="text-left">Customer</th><th className="text-left">Amount</th><th className="text-left">Status</th><th className="text-left">Date</th></tr></thead>
                    <tbody>
                      {analytics.recentOrders.map((o: any) => (
                        <tr key={o.id}>
                          <td><span className="font-mono text-xs text-gray-400">{o.id.slice(0,12)}...</span></td>
                          <td><span className="text-white text-xs">{o.customer_email}</span></td>
                          <td><span className="text-neon-500 font-bold">{fmt(o.total_amount)}</span></td>
                          <td><span className={`text-xs px-2 py-0.5 rounded-full border ${statusBg(o.payment_status)}`}>{o.payment_status}</span></td>
                          <td><span className="text-gray-500 text-xs">{new Date(o.created_at).toLocaleDateString()}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {analytics.topProducts?.length > 0 && (
                <div className="glass-card p-5">
                  <p className="text-white font-semibold text-sm mb-4">Top Products</p>
                  <div className="space-y-3">
                    {analytics.topProducts.map((p: any, i: number) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-neon-500/10 flex items-center justify-center text-neon-500 text-xs font-bold">{i+1}</div>
                          <span className="text-white text-sm">{p.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-gray-500 text-xs">{p.order_count} sales</span>
                          <span className="text-neon-500 font-bold text-sm">{fmt(p.revenue)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PRODUCTS */}
          {tab === 'products' && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-display font-bold text-white">Manage <span className="gold-text">Products</span></h2>
                <button onClick={openAddProduct} className="btn-gold flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold">
                  <Plus size={15}/> Add Product
                </button>
              </div>
              {products.length === 0
                ? <EmptyState icon={Package} text="No products yet" sub="Add your first product to get started"/>
                : <div className="glass-card overflow-x-auto">
                    <table className="w-full admin-table min-w-[600px]">
                      <thead><tr><th className="text-left">Product</th><th className="text-left">Price</th><th className="text-left">Stock</th><th className="text-left">Status</th><th className="text-left">Actions</th></tr></thead>
                      <tbody>
                        {products.map((p: any) => (
                          <tr key={p.id}>
                            <td>
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-neon-500/5 border border-neon-500/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                                  {p.image_url ? <img src={p.image_url} alt="" className="w-full h-full object-cover"/> : <Package size={14} className="text-neon-500/30"/>}
                                </div>
                                <div>
                                  <p className="text-white text-sm font-medium">{p.name}</p>
                                  <p className="text-gray-600 text-xs">{p.category_name}</p>
                                </div>
                              </div>
                            </td>
                            <td><span className="text-neon-500 font-bold font-mono">{fmtLTC(p.price)}</span></td>
                            <td><span className={`text-sm font-medium ${p.stock_count > 0 ? 'text-green-400' : 'text-red-400'}`}>{p.stock_count}</span></td>
                            <td><span className={`text-xs px-2 py-0.5 rounded-full border ${p.is_active ? 'text-green-400 border-green-400/30 bg-green-400/5' : 'text-gray-500 border-gray-500/30'}`}>{p.is_active ? 'Active' : 'Hidden'}</span></td>
                            <td>
                              <div className="flex items-center gap-2">
                                <button onClick={() => openEditProduct(p)} className="p-1.5 text-gray-500 hover:text-neon-500 transition-colors rounded border border-white/10 hover:border-neon-500/30"><Edit size={13}/></button>
                                <button onClick={() => handleDeleteProd(p)} className="p-1.5 text-gray-500 hover:text-red-400 transition-colors rounded border border-white/10 hover:border-red-400/30"><Trash2 size={13}/></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
              }
            </div>
          )}

          {/* STOCK */}
          {tab === 'stock' && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-display font-bold text-white">Stock <span className="gold-text">Management</span></h2>
                <button onClick={() => setModal('stock')} className="btn-gold flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold">
                  <Plus size={15}/> Add Stock
                </button>
              </div>
              <div className="glass-card p-5 mb-5">
                <Select label="View stock for product" value={stockPid} onChange={(e: any) => handleViewStock(e.target.value)}>
                  <option value="">Select a product...</option>
                  {products.map((p: any) => <option key={p.id} value={p.id}>{p.name} ({p.stock_count} items)</option>)}
                </Select>
              </div>
              {stockPid && (
                stockItems.length === 0
                  ? <EmptyState icon={Layers} text="No stock items" sub="Add items using the button above"/>
                  : <div className="glass-card overflow-x-auto">
                      <table className="w-full admin-table min-w-[400px]">
                        <thead><tr><th className="text-left">Item Content</th><th className="text-left">Status</th><th className="text-left">Added</th><th></th></tr></thead>
                        <tbody>
                          {stockItems.map((item: any) => (
                            <tr key={item.id}>
                              <td><span className="font-mono text-xs text-gray-300">{item.content}</span></td>
                              <td><span className={`text-xs ${item.is_delivered ? 'text-gray-500' : 'text-green-400'}`}>{item.is_delivered ? 'Delivered' : 'Available'}</span></td>
                              <td><span className="text-gray-500 text-xs">{new Date(item.created_at).toLocaleDateString()}</span></td>
                              <td><button onClick={() => handleDeleteStockItem(item)} className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"><Trash2 size={13}/></button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
              )}
            </div>
          )}

          {/* INVOICES */}
          {tab === 'invoices' && (
            <div>
              <h2 className="text-xl font-display font-bold text-white mb-5">Order <span className="gold-text">Invoices</span></h2>
              <div className="glass-card p-5 mb-5">
                <div className="relative">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"/>
                  <input type="text" value={invoiceQuery} onChange={e => handleInvoiceSearch(e.target.value)}
                    placeholder="Search by order ID or email..." className="input-gold w-full pl-10 pr-4 py-3 text-sm"
                  />
                </div>
              </div>
              {invoiceLoading ? (
                <div className="flex justify-center py-10"><div className="spinner"/></div>
              ) : invoiceResults.length > 0 ? (
                <div className="glass-card overflow-x-auto">
                  <table className="w-full admin-table min-w-[560px]">
                    <thead><tr><th className="text-left">Order ID</th><th className="text-left">Email</th><th className="text-left">Amount</th><th className="text-left">Status</th><th className="text-left">Date</th><th></th></tr></thead>
                    <tbody>
                      {invoiceResults.map((o: any) => (
                        <tr key={o.id} className="cursor-pointer hover:bg-white/5" onClick={() => setSelectedInvoice(o)}>
                          <td><span className="font-mono text-xs">{o.id.slice(0,14)}...</span></td>
                          <td><span className="text-xs">{o.customer_email}</span></td>
                          <td><span className="text-neon-500 font-bold">{fmt(o.total_amount)}</span></td>
                          <td><span className={`text-xs px-2 py-0.5 rounded-full border ${statusBg(o.payment_status)}`}>{o.payment_status}</span></td>
                          <td><span className="text-gray-500 text-xs">{new Date(o.created_at).toLocaleDateString()}</span></td>
                          <td><Eye size={13} className="text-gray-500"/></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : invoiceQuery ? (
                <EmptyState icon={Search} text="No orders found" sub="Try a different search term"/>
              ) : (
                <EmptyState icon={FileText} text="Search for orders above" sub="Enter an order ID or customer email"/>
              )}
            </div>
          )}

          {/* CATEGORIES */}
          {tab === 'categories' && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-display font-bold text-white">Manage <span className="gold-text">Categories</span></h2>
                <button onClick={() => setModal('category')} className="btn-gold flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold">
                  <Plus size={15}/> Add Category
                </button>
              </div>
              {categories.length === 0
                ? <EmptyState icon={Tag} text="No categories yet"/>
                : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((cat: any) => (
                      <div key={cat.id} className="glass-card p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{cat.icon}</span>
                          <div>
                            <p className="text-white text-sm font-medium">{cat.name}</p>
                            <p className="text-gray-500 text-xs">{cat.product_count} products</p>
                          </div>
                        </div>
                        <button onClick={() => handleDeleteCat(cat)} className="p-1.5 text-gray-600 hover:text-red-400 transition-colors"><Trash2 size={14}/></button>
                      </div>
                    ))}
                  </div>
              }
            </div>
          )}

          {/* PRICING */}
          {tab === 'pricing' && (
            <div>
              <h2 className="text-xl font-display font-bold text-white mb-5">Product <span className="gold-text">Pricing</span></h2>
              <form onSubmit={handleSetPrice} className="glass-card p-5 mb-6 space-y-4">
                <Select label="Product" value={priceForm.product_id} onChange={(e: any) => setPriceForm(f => ({...f, product_id: e.target.value}))}>
                  <option value="">Select product...</option>
                  {products.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </Select>
                <PriceInput label="New Price" value={priceForm.price}
                  onChange={(v) => setPriceForm(f => ({...f, price: v}))} placeholder="e.g. 9.99"/>
                <button type="submit" disabled={priceSaving} className="btn-gold w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                  {priceSaving ? <RefreshCw size={15} className="animate-spin"/> : <Check size={15}/>}
                  Update Price
                </button>
              </form>
              {products.length > 0 && (
                <div className="glass-card overflow-x-auto">
                  <table className="w-full admin-table min-w-[400px]">
                    <thead><tr><th className="text-left">Product</th><th className="text-left">Current Price</th><th></th></tr></thead>
                    <tbody>
                      {products.map((p: any) => (
                        <tr key={p.id}>
                          <td><span className="text-white text-sm">{p.name}</span></td>
                          <td><span className="text-neon-500 font-bold font-mono">{fmtLTC(p.price)}</span></td>
                          <td><button onClick={() => handleClearPrice(p)} className="text-xs text-gray-500 hover:text-red-400 transition-colors">Clear</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* SETTINGS */}
          {tab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-xl font-display font-bold text-white">Store <span className="gold-text">Settings</span></h2>

              {/* Store branding */}
              <SettingsSection title="Store Branding" icon={Globe}>
                <form onSubmit={handleStoreSave} className="space-y-4">
                  <Input
                    label="Store Name"
                    value={storeForm.store_name}
                    onChange={(e: any) => setStoreForm(f => ({...f, store_name: e.target.value}))}
                    placeholder="Galaxymart"
                  />
                  <div>
                    <label className="text-gray-400 text-sm mb-1.5 block">Logo URL (supports PNG, SVG, GIF)</label>
                    <input
                      type="url"
                      value={storeForm.logo_url}
                      onChange={(e: any) => setStoreForm(f => ({...f, logo_url: e.target.value}))}
                      placeholder="https://example.com/logo.png"
                      className="input-gold w-full px-4 py-3 text-sm"
                    />
                    {storeForm.logo_url && (
                      <div className="mt-2 flex items-center gap-3">
                        <img src={storeForm.logo_url} alt="Logo preview" className="w-10 h-10 object-contain rounded-lg border border-white/10 bg-white/5" onError={e => (e.currentTarget.style.display='none')}/>
                        <p className="text-gray-500 text-xs">Logo preview</p>
                      </div>
                    )}
                  </div>
                  <Input
                    label="Store Tagline"
                    value={storeForm.store_tagline}
                    onChange={(e: any) => setStoreForm(f => ({...f, store_tagline: e.target.value}))}
                    placeholder="Premium digital products delivered instantly."
                  />
                  <button type="submit" disabled={storeSaving} className="btn-gold w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                    {storeSaving ? <RefreshCw size={15} className="animate-spin"/> : <Save size={15}/>}
                    Save Branding
                  </button>
                </form>
              </SettingsSection>

              {/* Change Password */}
              <SettingsSection title="Change Admin Password" icon={Key}>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <Input
                    label="Current Password"
                    type="password"
                    value={pwForm.current_password}
                    onChange={(e: any) => setPwForm(f => ({...f, current_password: e.target.value}))}
                    placeholder="Enter current password"
                  />
                  <Input
                    label="New Password"
                    type="password"
                    value={pwForm.new_password}
                    onChange={(e: any) => setPwForm(f => ({...f, new_password: e.target.value}))}
                    placeholder="Min. 6 characters"
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    value={pwForm.confirm_password}
                    onChange={(e: any) => setPwForm(f => ({...f, confirm_password: e.target.value}))}
                    placeholder="Repeat new password"
                  />
                  <p className="text-gray-600 text-xs">After changing, you will be logged out automatically.</p>
                  <button type="submit" disabled={pwSaving} className="btn-gold w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                    {pwSaving ? <RefreshCw size={15} className="animate-spin"/> : <Key size={15}/>}
                    Change Password
                  </button>
                </form>
              </SettingsSection>

              {/* LTC Addresses */}
              <SettingsSection title="LTC Wallet Addresses" icon={Bitcoin}>
                <div className="flex justify-end mb-4">
                  <button onClick={() => setModal('ltc')} className="btn-gold flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold">
                    <Plus size={14}/> Add Address
                  </button>
                </div>
                {ltcAddresses.length === 0
                  ? <EmptyState icon={Bitcoin} text="No LTC addresses" sub="Add a wallet address to receive payments"/>
                  : <div className="space-y-3">
                      {ltcAddresses.map((addr: any) => (
                        <div key={addr.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${addr.is_active ? 'bg-neon-500 animate-pulse' : 'bg-gray-600'}`}/>
                            <div className="min-w-0">
                              <p className="text-white text-xs font-mono truncate">{addr.address}</p>
                              {addr.label && <p className="text-gray-500 text-xs">{addr.label}</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {!addr.is_active && <button onClick={() => handleActivateLtc(addr.id)} className="text-xs text-neon-500 hover:text-neon-400 transition-colors">Activate</button>}
                            <button onClick={() => handleDeleteLtc(addr)} className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"><Trash2 size={13}/></button>
                          </div>
                        </div>
                      ))}
                    </div>
                }
              </SettingsSection>

              {/* Reviews */}
              <SettingsSection title="Customer Reviews" icon={Star}>
                {reviews.length === 0
                  ? <EmptyState icon={Star} text="No reviews yet"/>
                  : <div className="space-y-3">
                      {reviews.map((r: any) => (
                        <div key={r.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-white text-sm font-medium">{r.customer_name}</span>
                              <div className="flex gap-0.5">{[...Array(r.rating)].map((_: any, i: number) => <Star key={i} size={10} className="text-yellow-400" fill="currentColor"/>)}</div>
                            </div>
                            <p className="text-gray-400 text-xs">{r.comment}</p>
                          </div>
                          <button onClick={() => handleDeleteReview(r)} className="p-1.5 text-gray-500 hover:text-red-400 transition-colors flex-shrink-0"><Trash2 size={13}/></button>
                        </div>
                      ))}
                    </div>
                }
              </SettingsSection>
            </div>
          )}

          </> : null}
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {modal === 'product' && (
          <Modal title={editingProd ? 'Edit Product' : 'Add Product'} onClose={() => setModal(null)} wide>
            <form onSubmit={handleProdSubmit} className="space-y-4">
              <Input label="Name *" value={prodForm.name} onChange={(e: any) => setProdForm((f: any) => ({...f, name: e.target.value}))} placeholder="Product name"/>
              <Textarea label="Description" rows={3} value={prodForm.description} onChange={(e: any) => setProdForm((f: any) => ({...f, description: e.target.value}))} placeholder="Product description"/>
              <Textarea label="Bullet Points (one per line)" rows={4} value={prodForm.bullet_points} onChange={(e: any) => setProdForm((f: any) => ({...f, bullet_points: e.target.value}))} placeholder="• Feature one&#10;• Feature two"/>
              <div className="grid grid-cols-2 gap-4">
                <PriceInput label="Price" value={String(prodForm.price ?? '')} onChange={(v) => setProdForm((f: any) => ({...f, price: v}))} placeholder="9.99"/>
                <Input label="Initial Stock" type="number" min="0" value={prodForm.stock_count} onChange={(e: any) => setProdForm((f: any) => ({...f, stock_count: e.target.value}))}/>
              </div>
              <Select label="Category" value={prodForm.category_id} onChange={(e: any) => setProdForm((f: any) => ({...f, category_id: e.target.value}))}>
                <option value="">No category</option>
                {categories.map((c: any) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </Select>

              {/* Image section */}
              <div className="space-y-3 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-2 mb-2">
                  <ImageIcon size={13} className="text-gray-500"/>
                  <span className="text-gray-400 text-sm font-medium">Product Image</span>
                </div>
                <div>
                  <label className="text-gray-500 text-xs mb-1.5 block">Image URL (supports GIF / animated)</label>
                  <input
                    type="url"
                    value={prodForm.image_url}
                    onChange={(e: any) => setProdForm((f: any) => ({...f, image_url: e.target.value}))}
                    placeholder="https://example.com/product.gif"
                    className="input-gold w-full px-4 py-3 text-sm"
                  />
                  {prodForm.image_url && (
                    <div className="mt-2">
                      <img src={prodForm.image_url} alt="Preview" className="h-16 w-auto rounded-lg border border-white/10 object-contain bg-white/5" onError={e => (e.currentTarget.style.display='none')}/>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-xs">
                  <span>— or —</span>
                </div>
                <div>
                  <label className="text-gray-500 text-xs mb-1.5 block">Upload image file (overrides URL above)</label>
                  <input type="file" accept="image/*,image/gif" onChange={e => setProdImage(e.target.files?.[0] || null)} className="text-gray-400 text-sm w-full"/>
                  {prodImage && <p className="text-neon-500 text-xs mt-1">✓ {prodImage.name}</p>}
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                  <input type="checkbox" checked={prodForm.featured} onChange={e => setProdForm((f: any) => ({...f, featured: e.target.checked}))} className="rounded"/>
                  Featured
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                  <input type="checkbox" checked={prodForm.is_active} onChange={e => setProdForm((f: any) => ({...f, is_active: e.target.checked}))} className="rounded"/>
                  Active
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)} className="flex-1 py-3 rounded-xl text-sm text-gray-400 border border-white/10 hover:border-white/20 transition-all">Cancel</button>
                <button type="submit" className="flex-1 btn-gold py-3 rounded-xl font-bold text-sm">{editingProd ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </Modal>
        )}

        {modal === 'stock' && (
          <Modal title="Add Stock Items" onClose={() => setModal(null)}>
            <form onSubmit={handleStockSubmit} className="space-y-4">
              <Select label="Product *" value={stockForm.product_id} onChange={(e: any) => setStockForm(f => ({...f, product_id: e.target.value}))}>
                <option value="">Select product...</option>
                {products.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Select>
              <Textarea label="Stock Items (one per line)" rows={8} value={stockForm.items} onChange={(e: any) => setStockForm(f => ({...f, items: e.target.value}))} placeholder="License key 1&#10;License key 2&#10;..."/>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)} className="flex-1 py-3 rounded-xl text-sm text-gray-400 border border-white/10">Cancel</button>
                <button type="submit" className="flex-1 btn-gold py-3 rounded-xl font-bold text-sm">Add Items</button>
              </div>
            </form>
          </Modal>
        )}

        {modal === 'category' && (
          <Modal title="Add Category" onClose={() => setModal(null)}>
            <form onSubmit={handleCatSubmit} className="space-y-4">
              <Input label="Name *" value={catForm.name} onChange={(e: any) => setCatForm(f => ({...f, name: e.target.value}))} placeholder="e.g. Gaming"/>
              <Input label="Icon (emoji)" value={catForm.icon} onChange={(e: any) => setCatForm(f => ({...f, icon: e.target.value}))} placeholder="🎮"/>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)} className="flex-1 py-3 rounded-xl text-sm text-gray-400 border border-white/10">Cancel</button>
                <button type="submit" className="flex-1 btn-gold py-3 rounded-xl font-bold text-sm">Create</button>
              </div>
            </form>
          </Modal>
        )}

        {modal === 'ltc' && (
          <Modal title="Add LTC Address" onClose={() => setModal(null)}>
            <form onSubmit={handleLtcSubmit} className="space-y-4">
              <Input label="LTC Address *" value={ltcForm.address} onChange={(e: any) => setLtcForm(f => ({...f, address: e.target.value}))} placeholder="Ltc..."/>
              <Input label="Label (optional)" value={ltcForm.label} onChange={(e: any) => setLtcForm(f => ({...f, label: e.target.value}))} placeholder="Main wallet"/>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)} className="flex-1 py-3 rounded-xl text-sm text-gray-400 border border-white/10">Cancel</button>
                <button type="submit" className="flex-1 btn-gold py-3 rounded-xl font-bold text-sm">Add</button>
              </div>
            </form>
          </Modal>
        )}

        {selectedInvoice && (
          <Modal title="Order Details" onClose={() => setSelectedInvoice(null)}>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Order ID</span><span className="font-mono text-xs text-white">{selectedInvoice.id}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="text-white">{selectedInvoice.customer_email}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Amount</span><span className="text-neon-500 font-bold">{fmt(selectedInvoice.total_amount)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Payment</span><span className={statusColor(selectedInvoice.payment_status)}>{selectedInvoice.payment_status}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Delivery</span><span className="text-white">{selectedInvoice.delivery_status || '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="text-white">{new Date(selectedInvoice.created_at).toLocaleString()}</span></div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {confirm && <ConfirmModal {...confirm} onCancel={() => setConfirm(null)} />}
    </div>
  );
}

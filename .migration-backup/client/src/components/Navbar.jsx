import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Menu, X, ChevronDown, User } from 'lucide-react';
import { useCart } from '../lib/cart';

const navLinks = [
  { label: 'Home', page: 'home' },
  { label: 'Products', page: 'products' },
  { label: 'Reviews', page: 'reviews' },
  { label: 'Terms', page: 'terms' },
  { label: 'Status', page: 'status' },
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'BTC', 'LTC'];

export default function Navbar({ page, setPage }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [showCurrency, setShowCurrency] = useState(false);
  const { count } = useCart();

  return (
    <header className="navbar-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <button
            onClick={() => setPage('home')}
            className="flex items-center gap-2 group"
            data-testid="logo-home"
          >
            <div className="w-8 h-8 rounded border border-neon-500/40 flex items-center justify-center bg-neon-500/5 group-hover:border-neon-500/80 group-hover:bg-neon-500/10 transition-all">
              <span className="text-sm">🐉</span>
            </div>
            <span className="font-mono text-sm font-bold text-neon-500 hidden sm:block tracking-wider">
              DRAGONZ<span className="text-white">STORE</span>
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <button
                key={link.page}
                onClick={() => setPage(link.page)}
                data-testid={`nav-${link.page}`}
                className={`px-3 py-1.5 rounded text-xs font-medium tracking-wider uppercase transition-all duration-200 ${
                  page === link.page
                    ? 'text-neon-500 bg-neon-500/10 border border-neon-500/30'
                    : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Currency dropdown */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setShowCurrency(!showCurrency)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs text-gray-400 border border-white/10 hover:border-neon-500/30 hover:text-neon-500 transition-all"
                data-testid="currency-dropdown"
              >
                <span className="font-mono">{currency}</span>
                <ChevronDown size={11} />
              </button>
              <AnimatePresence>
                {showCurrency && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute right-0 top-full mt-1 glass-card py-1 min-w-[80px] z-50"
                    onMouseLeave={() => setShowCurrency(false)}
                  >
                    {CURRENCIES.map(c => (
                      <button
                        key={c}
                        onClick={() => { setCurrency(c); setShowCurrency(false); }}
                        className={`w-full text-left px-3 py-1.5 text-xs font-mono transition-colors ${
                          currency === c ? 'text-neon-500' : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Admin button */}
            <button
              onClick={() => setPage('admin-login')}
              data-testid="nav-admin-login"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold text-neon-500 border border-neon-500/30 hover:bg-neon-500/10 hover:border-neon-500/60 transition-all"
            >
              <User size={12} />
              Admin
            </button>

            {/* Cart */}
            <button
              onClick={() => setPage('cart')}
              data-testid="cart-button"
              className="relative flex items-center gap-1.5 px-3 py-1.5 btn-green rounded text-xs font-bold"
            >
              <span><ShoppingCart size={13} /></span>
              <span className="hidden sm:inline">Cart</span>
              {count > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-neon-500 text-black text-[10px] rounded-full flex items-center justify-center font-bold"
                >
                  {count}
                </motion.span>
              )}
            </button>

            {/* Mobile menu */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-1.5 text-gray-400 hover:text-neon-500 transition-colors border border-white/10 rounded"
              data-testid="mobile-menu-toggle"
            >
              {mobileOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-neon-500/10 bg-black/95"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map(link => (
                <button
                  key={link.page}
                  onClick={() => { setPage(link.page); setMobileOpen(false); }}
                  className={`w-full text-left px-3 py-2.5 rounded text-sm font-medium uppercase tracking-wider transition-all ${
                    page === link.page
                      ? 'text-neon-500 bg-neon-500/10 border border-neon-500/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </button>
              ))}
              <div className="pt-2 border-t border-white/5 flex gap-2">
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  className="input-green flex-1 px-3 py-2 text-sm bg-transparent"
                >
                  {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                </select>
                <button
                  onClick={() => { setPage('admin-login'); setMobileOpen(false); }}
                  className="flex-1 px-3 py-2 text-sm font-semibold text-neon-500 border border-neon-500/30 rounded hover:bg-neon-500/10 transition-all"
                >
                  Admin
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

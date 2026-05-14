import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Menu, X, ChevronDown, LogIn, Star } from 'lucide-react';
import { useCart } from '../lib/cart';
import { useLocation } from 'wouter';

const navLinks = [
  { label: 'Home',     href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Reviews',  href: '/reviews' },
  { label: 'Status',   href: '/status' },
  { label: 'Blog',     href: '/terms' },
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'BTC', 'LTC'];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [showCurrency, setShowCurrency] = useState(false);
  const { count } = useCart();
  const [location, navigate] = useLocation();

  const isActive = (href: string) =>
    href === '/' ? location === '/' : location.startsWith(href);

  return (
    <header className="navbar-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 group"
            data-testid="logo-home"
          >
            <div className="w-8 h-8 flex items-center justify-center">
              <Star size={22} className="text-[#3b82f6] fill-[#3b82f6] drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
            </div>
            <span className="font-display text-base font-bold tracking-widest text-white">
              GALAXY <span className="text-[#60a5fa]">MART</span>
            </span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <button
                key={link.href}
                onClick={() => navigate(link.href)}
                data-testid={`nav-${link.href.replace('/', '') || 'home'}`}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium tracking-wide transition-all duration-200 ${
                  isActive(link.href)
                    ? 'text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
                {isActive(link.href) && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-[#3b82f6] rounded-full"
                    style={{ boxShadow: '0 0 8px rgba(59,130,246,0.8)' }}
                  />
                )}
              </button>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Currency */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setShowCurrency(!showCurrency)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-300 border border-white/10 hover:border-[#3b82f6]/40 hover:text-white transition-all bg-white/[0.03]"
                data-testid="currency-dropdown"
              >
                <span className="font-mono font-medium">{currency}</span>
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
                          currency === c ? 'text-[#60a5fa]' : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Login */}
            <button
              onClick={() => navigate('/admin/login')}
              data-testid="nav-admin-login"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-300 border border-white/10 hover:border-white/25 hover:text-white transition-all bg-white/[0.03]"
            >
              <LogIn size={13} />
              Login
            </button>

            {/* Discord */}
            <a
              href="https://discord.gg"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all"
              style={{ background: '#5865F2', boxShadow: '0 0 16px rgba(88,101,242,0.4)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.003.028.018.055.04.067a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .039-.065c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
              </svg>
              Discord
            </a>

            {/* Cart */}
            <button
              onClick={() => navigate('/cart')}
              data-testid="cart-button"
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white border border-[#3b82f6]/30 hover:border-[#3b82f6]/60 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all bg-[#3b82f6]/10"
            >
              <ShoppingCart size={14} />
              <span className="hidden sm:inline">Cart</span>
              {count > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center font-bold text-white text-[10px]"
                  style={{ background: '#3b82f6', boxShadow: '0 0 8px rgba(59,130,246,0.8)' }}
                >
                  {count}
                </motion.span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-1.5 text-gray-400 hover:text-white transition-colors border border-white/10 rounded-lg"
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
            className="md:hidden border-t border-[#3b82f6]/10 bg-[#05090f]/98"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map(link => (
                <button
                  key={link.href}
                  onClick={() => { navigate(link.href); setMobileOpen(false); }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium tracking-wide transition-all ${
                    isActive(link.href)
                      ? 'text-[#60a5fa] bg-[#3b82f6]/10 border border-[#3b82f6]/25'
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
                  className="input-gold flex-1 px-3 py-2 text-sm bg-transparent"
                >
                  {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                </select>
                <button
                  onClick={() => { navigate('/admin/login'); setMobileOpen(false); }}
                  className="flex-1 px-3 py-2 text-sm font-semibold text-[#60a5fa] border border-[#3b82f6]/30 rounded-lg hover:bg-[#3b82f6]/10 transition-all"
                >
                  Login
                </button>
                <a
                  href="https://discord.gg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-bold text-white rounded-lg"
                  style={{ background: '#5865F2' }}
                >
                  Discord
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, Clock, Star, ChevronRight, Package, Users, CheckCircle, ArrowRight, Box } from 'lucide-react';
import { productsApi, reviewsApi } from '../lib/api';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import { useLocation } from 'wouter';

const FEATURES = [
  { icon: Zap,    title: 'Instant Delivery',  desc: 'Ready within seconds' },
  { icon: Shield, title: '100% Undetected',   desc: 'Industry-leading protection' },
  { icon: Clock,  title: '24/7 Support',      desc: 'Fast & reliable assistance' },
];

function ProductPreviewCard() {
  return (
    <motion.div
      animate={{ y: [0, -14, 0] }}
      transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
      style={{ transform: 'rotate(-3deg)' }}
      className="relative w-full max-w-[480px] mx-auto"
    >
      {/* Glow behind card */}
      <div className="absolute inset-0 rounded-2xl blur-2xl opacity-30"
        style={{ background: 'radial-gradient(ellipse, #3b82f6 0%, #6366f1 50%, transparent 80%)' }} />

      <div className="relative rounded-2xl overflow-hidden border border-[#3b82f6]/40"
        style={{
          background: 'rgba(8,14,32,0.95)',
          boxShadow: '0 0 60px rgba(59,130,246,0.25), 0 0 120px rgba(99,102,241,0.1), inset 0 0 0 1px rgba(59,130,246,0.15)'
        }}
      >
        {/* Window title bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#3b82f6]/20"
          style={{ background: 'rgba(15,24,50,0.9)' }}>
          <span className="text-white text-xs font-semibold tracking-wide">Black Ops 6 Extreme</span>
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
          </div>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-28 border-r border-[#3b82f6]/15 py-3"
            style={{ background: 'rgba(10,16,36,0.8)' }}>
            {[
              { icon: '🎯', label: 'Aimbot',   active: true },
              { icon: '👁️', label: 'Visuals',  active: false },
              { icon: '🧟', label: 'Zombies',  active: false },
              { icon: '💰', label: 'Loot',     active: false },
              { icon: '⚙️', label: 'Configs',  active: false },
            ].map((item) => (
              <div key={item.label}
                className={`flex items-center gap-2 px-3 py-2 text-xs cursor-pointer transition-all ${
                  item.active
                    ? 'text-[#60a5fa] bg-[#3b82f6]/15 border-r-2 border-[#3b82f6]'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <span className="text-[10px]">{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>

          {/* Main panel */}
          <div className="flex-1 p-3 space-y-2">
            {[
              { label: 'Active Aimbot',   enabled: true,  btn: null },
              { label: 'Mouse Sensitivity', enabled: false, btn: 'Right Click' },
              { label: 'Controller Button', enabled: false, btn: 'L2 (LT)' },
              { label: 'Bone Target',     enabled: false, btn: 'Head' },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between py-1">
                <span className="text-gray-300 text-[11px]">{row.label}</span>
                <div className="flex items-center gap-2">
                  {row.btn && (
                    <span className="text-[#60a5fa] text-[10px] px-1.5 py-0.5 rounded bg-[#3b82f6]/10 border border-[#3b82f6]/20">
                      {row.btn}
                    </span>
                  )}
                  {row.enabled ? (
                    <div className="w-6 h-3.5 rounded-full bg-[#3b82f6] flex items-end justify-end pr-0.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-white" />
                    </div>
                  ) : (
                    <div className="w-6 h-3.5 rounded-full bg-gray-700 flex items-start justify-start pl-0.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Slider */}
            <div className="pt-1">
              <div className="flex justify-between mb-1">
                <span className="text-gray-400 text-[10px]">FOV</span>
                <span className="text-[#60a5fa] text-[10px] font-mono">96</span>
              </div>
              <div className="w-full h-1 bg-gray-700 rounded-full">
                <div className="h-full w-3/4 rounded-full" style={{ background: 'linear-gradient(90deg, #3b82f6, #6366f1)' }} />
              </div>
            </div>

            <div className="pt-1">
              <div className="flex justify-between mb-1">
                <span className="text-gray-400 text-[10px]">Smoothing</span>
                <span className="text-[#60a5fa] text-[10px] font-mono">1</span>
              </div>
              <div className="w-full h-1 bg-gray-700 rounded-full">
                <div className="h-full w-1/12 rounded-full" style={{ background: 'linear-gradient(90deg, #3b82f6, #6366f1)' }} />
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="w-32 border-l border-[#3b82f6]/15 p-3 space-y-2"
            style={{ background: 'rgba(8,12,28,0.8)' }}>
            <p className="text-gray-500 text-[9px] uppercase tracking-wider mb-2">Visual Settings</p>
            {[
              { label: 'Verify Visibility', on: true },
              { label: 'Show Crosshair',    on: true },
              { label: 'Include Team',      on: false },
              { label: 'Ignore KO',         on: true },
              { label: 'Lock Crosshair',    on: true },
              { label: 'Prediction',        on: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-gray-400 text-[9px]">{item.label}</span>
                <div className={`w-3 h-3 rounded-sm border flex items-center justify-center ${
                  item.on ? 'bg-[#3b82f6] border-[#3b82f6]' : 'border-gray-600'
                }`}>
                  {item.on && <div className="w-1.5 h-1.5 bg-white rounded-sm" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer bar */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-[#3b82f6]/15"
          style={{ background: 'rgba(10,16,36,0.9)' }}>
          <span className="text-gray-600 text-[10px] font-mono">FPS: 62</span>
          <span className="text-gray-600 text-[10px]">Language</span>
          <span className="text-[#60a5fa] text-[10px]">French</span>
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500 text-[10px]">Dark Mode</span>
            <div className="w-5 h-3 rounded-full bg-[#3b82f6] flex items-end justify-end pr-0.5">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [, navigate] = useLocation();

  useEffect(() => {
    Promise.all([
      productsApi.getAll({ featured: 'true' }),
      reviewsApi.getAll(),
    ]).then(([products, revs]: any) => {
      setFeaturedProducts((products || []).slice(0, 4));
      setReviews((revs || []).slice(0, 6));
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section className="relative min-h-[calc(100vh-64px)] flex flex-col justify-center overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 items-center">

            {/* LEFT */}
            <div>
              {/* Badge */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-7 text-sm font-medium text-[#60a5fa] border border-[#3b82f6]/30"
                  style={{ background: 'rgba(59,130,246,0.08)' }}>
                  <Zap size={13} className="text-[#3b82f6]" fill="currentColor" />
                  #1 Cheapest Item Provider
                </div>
              </motion.div>

              {/* Big title */}
              <motion.h1
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.08 }}
                className="font-display font-black leading-[1.05] mb-6"
                style={{ fontSize: 'clamp(2.8rem, 6vw, 5rem)' }}
              >
                <span className="text-white">#1 Cheapest</span>
                <br />
                <span style={{
                  background: 'linear-gradient(135deg, #60a5fa 0%, #818cf8 60%, #60a5fa 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  Item Provider
                </span>
              </motion.h1>

              {/* Rating row */}
              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.16 }}
                className="flex flex-wrap items-center gap-4 mb-6 text-sm"
              >
                <div className="flex items-center gap-1.5">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} size={15} className="text-yellow-400" fill="#facc15" />
                  ))}
                  <span className="text-white font-bold ml-1">5.0</span>
                </div>
                <span className="text-gray-600">|</span>
                <span className="text-gray-300">
                  <span className="text-white font-bold">50,000+</span> Happy Customers
                </span>
                <span className="text-gray-600">|</span>
                <span className="text-gray-300">
                  <span className="text-white font-bold">99.9%</span> Uptime
                </span>
              </motion.div>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.22 }}
                className="text-gray-400 leading-relaxed mb-6 max-w-lg"
                style={{ fontSize: '0.9375rem' }}
              >
                STAR V3 delivers the <span className="text-white font-semibold">fastest instant-delivery items</span> with{' '}
                <span className="text-white font-semibold">100% undetected performance</span> and constantly updated
                products. Experience premium security, smooth setup, and 24/7 expert support.
              </motion.p>

              {/* Bullet points */}
              <motion.ul
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.28 }}
                className="space-y-2.5 mb-8"
              >
                {FEATURES.map((f) => (
                  <li key={f.title} className="flex items-center gap-3 text-sm">
                    <CheckCircle size={16} className="text-[#3b82f6] flex-shrink-0"
                      style={{ filter: 'drop-shadow(0 0 6px rgba(59,130,246,0.6))' }} />
                    <span className="text-white font-semibold">{f.title}</span>
                    <span className="text-gray-500">{f.desc}</span>
                  </li>
                ))}
              </motion.ul>

              {/* Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.34 }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <button
                  onClick={() => navigate('/products')}
                  className="flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl text-sm font-bold text-white transition-all animate-pulse-glow"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                    boxShadow: '0 0 24px rgba(59,130,246,0.4)',
                  }}
                  data-testid="button-start-shopping"
                >
                  <Zap size={16} fill="currentColor" />
                  Start Ordering Now!
                  <ArrowRight size={16} />
                </button>
                <a
                  href="https://discord.gg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                  style={{ background: '#5865F2', boxShadow: '0 0 18px rgba(88,101,242,0.35)' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.003.028.018.055.04.067a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .039-.065c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
                  </svg>
                  Join Our Discord
                </a>
              </motion.div>
            </div>

            {/* RIGHT — floating product preview */}
            <motion.div
              initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="hidden lg:block"
            >
              <ProductPreviewCard />
            </motion.div>
          </div>

          {/* STATS */}
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16"
          >
            {[
              { icon: Users, label: 'Customers',      value: '0',   color: '#3b82f6' },
              { icon: Box,   label: 'Products Sold',  value: '0',   color: '#6366f1' },
              { icon: Clock, label: 'Response Time',  value: '<5m', color: '#3b82f6' },
            ].map((s, i) => (
              <div key={i} className="glass-card p-5 flex items-center gap-4 hover:scale-[1.02] transition-transform">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `rgba(${s.color === '#6366f1' ? '99,102,241' : '59,130,246'},0.12)`, border: `1px solid rgba(${s.color === '#6366f1' ? '99,102,241' : '59,130,246'},0.25)` }}>
                  <s.icon size={22} style={{ color: s.color, filter: `drop-shadow(0 0 8px ${s.color}80)` }} />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white font-display">{s.value}</p>
                  <p className="text-gray-500 text-sm">{s.label}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <h2 className="font-display font-bold text-white text-3xl mb-3">
            Why Choose <span className="gold-text">STAR V3</span>?
          </h2>
          <p className="text-gray-500">Everything you need in one place, delivered instantly.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Zap,    title: 'Instant Delivery',   desc: 'Your digital products delivered automatically within seconds of payment confirmation.',   color: '#3b82f6' },
            { icon: Shield, title: '100% Secure',        desc: 'Crypto payments with full anonymity. Your data is never stored or shared.',                color: '#6366f1' },
            { icon: Clock,  title: '24/7 Support',       desc: 'Round-the-clock support for all your questions via Discord and live chat.',                color: '#3b82f6' },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="glass-card p-6 group hover:scale-[1.03] transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300"
                style={{ background: `rgba(${f.color === '#6366f1' ? '99,102,241' : '59,130,246'},0.1)`, border: `1px solid rgba(${f.color === '#6366f1' ? '99,102,241' : '59,130,246'},0.25)` }}>
                <f.icon size={22} style={{ color: f.color }} />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="font-display font-bold text-white text-3xl mb-2">
              Featured <span className="gold-text">Products</span>
            </h2>
            <p className="text-gray-500 text-sm">Our most popular digital items</p>
          </div>
          <button
            onClick={() => navigate('/products')}
            className="flex items-center gap-2 text-[#60a5fa] hover:text-[#93c5fd] text-sm font-medium group transition-colors"
          >
            View All
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        {loading ? (
          <div className="flex justify-center py-20"><div className="spinner" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredProducts.map((product: any, i: number) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* REVIEWS */}
      {reviews.length > 0 && (
        <section className="py-20" style={{ background: 'linear-gradient(to bottom, transparent, rgba(8,13,28,0.6), transparent)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
              <h2 className="font-display font-bold text-white text-3xl mb-3">
                What Customers <span className="gold-text">Say</span>
              </h2>
              <div className="flex items-center justify-center gap-1 mb-2">
                {[1,2,3,4,5].map(i => <Star key={i} size={20} className="text-yellow-400" fill="#facc15" />)}
                <span className="text-yellow-400 font-bold ml-2">5.0</span>
              </div>
              <p className="text-gray-500 text-sm">{reviews.length}+ verified reviews</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {reviews.map((review: any, i: number) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="glass-card p-5"
                >
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(review.rating)].map((_: any, j: number) => (
                      <Star key={j} size={14} className="text-yellow-400" fill="#facc15" />
                    ))}
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed mb-4">"{review.comment}"</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>
                      {review.customer_name[0]}
                    </div>
                    <span className="text-white text-sm font-medium">{review.customer_name}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-card p-12 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at center top, rgba(59,130,246,0.08) 0%, transparent 70%)' }} />
          <div className="relative z-10">
            <Star size={48} className="mx-auto mb-4 text-[#3b82f6]" fill="#3b82f6"
              style={{ filter: 'drop-shadow(0 0 16px rgba(59,130,246,0.7))' }} />
            <h2 className="font-display font-bold text-white text-4xl mb-4">Ready to Get Started?</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">Browse our premium collection of digital items and get instant delivery.</p>
            <button
              onClick={() => navigate('/products')}
              className="inline-flex items-center gap-2.5 px-10 py-4 rounded-xl text-base font-bold text-white transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', boxShadow: '0 0 30px rgba(59,130,246,0.4)' }}
              data-testid="button-browse-products"
            >
              <Package size={20} />
              Browse Products
            </button>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}

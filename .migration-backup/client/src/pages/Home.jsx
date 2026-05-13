import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, Clock, Star, ChevronRight, Package, TrendingUp, Users } from 'lucide-react';
import { productsApi, reviewsApi } from '../lib/api';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';

const STATS = [
  { icon: Users, label: 'Happy Customers', value: '2,500+' },
  { icon: Package, label: 'Products Sold', value: '10,000+' },
  { icon: Clock, label: 'Avg Delivery', value: '< 5min' },
  { icon: Star, label: 'Rating', value: '5.0 / 5' },
];

const FEATURES = [
  { icon: Zap, title: 'Instant Delivery', desc: 'Your digital products delivered automatically after payment confirmation.' },
  { icon: Shield, title: '100% Secure', desc: 'Crypto payments with full anonymity. Your data is never stored.' },
  { icon: Clock, title: '24/7 Support', desc: 'Round-the-clock support for all your questions and concerns.' },
];

export default function Home({ setPage, setSelectedProduct }) {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      productsApi.getAll({ featured: 'true' }),
      reviewsApi.getAll(),
      productsApi.getStats(),
    ]).then(([products, revs, st]) => {
      setFeaturedProducts(products.slice(0, 4));
      setReviews(revs.slice(0, 6));
      setStats(st);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#080808]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-yellow-400/30 bg-yellow-400/5 text-yellow-400 text-sm font-medium mb-8">
                  <Star size={14} fill="currentColor" />
                  #1 Premium Digital Products Store
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-display font-black leading-none mb-6"
              >
                <span className="text-white">Premium</span>
                <br />
                <span className="gold-shimmer">Digital</span>
                <br />
                <span className="text-white">Products</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-gray-400 text-lg leading-relaxed mb-8 max-w-lg"
              >
                Instant delivery of premium digital goods. Accounts, software, gaming keys and more — all secured with Litecoin payments.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 mb-12"
              >
                <button
                  onClick={() => setPage('products')}
                  className="btn-gold flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-bold animate-pulse-glow"
                  data-testid="button-start-shopping"
                >
                  <Zap size={18} />
                  Start Shopping
                  <ChevronRight size={18} />
                </button>
                <button
                  onClick={() => setPage('status')}
                  className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-medium text-gray-300 border border-white/10 hover:border-yellow-400/30 hover:text-white transition-all duration-300"
                  data-testid="button-check-order"
                >
                  Check Order Status
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap gap-6"
              >
                {FEATURES.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-400">
                    <f.icon size={16} className="text-yellow-500" />
                    {f.title}
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right side cards */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:grid grid-cols-2 gap-4"
            >
              {[
                { icon: '🎮', label: 'Gaming Keys', color: 'from-purple-900/40 to-purple-800/20' },
                { icon: '📺', label: 'Streaming', color: 'from-red-900/40 to-red-800/20' },
                { icon: '🔧', label: 'Software', color: 'from-blue-900/40 to-blue-800/20' },
                { icon: '📱', label: 'Social Media', color: 'from-green-900/40 to-green-800/20' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay: i * 0.8 }}
                  className={`glass-card p-6 bg-gradient-to-br ${item.color} flex flex-col items-center justify-center gap-3 aspect-square cursor-pointer hover:scale-105 transition-transform`}
                  onClick={() => setPage('products')}
                >
                  <span className="text-5xl">{item.icon}</span>
                  <span className="text-white font-semibold text-sm">{item.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {STATS.map((s, i) => (
              <div key={i} className="glass-card p-5 text-center group hover:scale-105 transition-transform duration-300">
                <s.icon size={20} className="mx-auto mb-2 text-yellow-500" />
                <div className="text-2xl font-bold gold-text mb-1">{s.value}</div>
                <div className="text-gray-500 text-xs">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl font-display font-bold text-white mb-3">Why Choose <span className="gold-text">DragonzStore</span>?</h2>
          <p className="text-gray-500">Everything you need in one place, delivered securely.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 group hover:scale-105 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-yellow-400/10 flex items-center justify-center mb-4 group-hover:bg-yellow-400/20 transition-colors">
                <f.icon size={24} className="text-yellow-500" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-display font-bold text-white mb-2">Featured <span className="gold-text">Products</span></h2>
            <p className="text-gray-500 text-sm">Our most popular digital products</p>
          </div>
          <button
            onClick={() => setPage('products')}
            className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 text-sm font-medium group"
          >
            View All
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="spinner" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} setPage={setPage} setSelectedProduct={setSelectedProduct} />
            ))}
          </div>
        )}
      </section>

      {/* Reviews */}
      {reviews.length > 0 && (
        <section className="py-20 bg-gradient-to-b from-transparent via-[#0a0a0a] to-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-14"
            >
              <h2 className="text-3xl font-display font-bold text-white mb-3">What Customers <span className="gold-text">Say</span></h2>
              <div className="flex items-center justify-center gap-1 mb-2">
                {[1,2,3,4,5].map(i => <Star key={i} size={20} className="text-yellow-400" fill="currentColor" />)}
                <span className="text-yellow-400 font-bold ml-2">5.0</span>
              </div>
              <p className="text-gray-500 text-sm">{reviews.length}+ verified reviews</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {reviews.map((review, i) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="glass-card p-5"
                >
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(review.rating)].map((_, j) => (
                      <Star key={j} size={14} className="text-yellow-400" fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed mb-4">"{review.comment}"</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-yellow-400/20 flex items-center justify-center text-yellow-400 font-bold text-sm">
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
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-card p-12 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent" />
          <div className="relative z-10">
            <span className="text-5xl mb-4 block">🐉</span>
            <h2 className="text-4xl font-display font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Browse our premium collection of digital products and get instant delivery.
            </p>
            <button
              onClick={() => setPage('products')}
              className="btn-gold inline-flex items-center gap-2 px-10 py-4 rounded-xl text-lg font-bold"
              data-testid="button-browse-products"
            >
              <Zap size={20} />
              Browse Products
            </button>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}

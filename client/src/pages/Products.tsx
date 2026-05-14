import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { productsApi, categoriesApi } from '../lib/api';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoriesApi.getAll().then((cats: any) => setCategories(cats || []));
  }, []);

  useEffect(() => {
    setLoading(true);
    productsApi.getAll({
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      search: search || undefined
    }).then((prods: any) => setProducts(prods || []))
      .finally(() => setLoading(false));
  }, [selectedCategory, search]);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-4xl font-display font-bold text-white mb-2">Our <span className="gold-text">Products</span></h1>
          <p className="text-gray-500">Browse our premium digital goods collection</p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          <motion.aside initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:w-60 flex-shrink-0">
            <div className="glass-card p-5 sticky top-24">
              <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Categories</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory('all')}
                  data-testid="category-all"
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-between ${
                    selectedCategory === 'all'
                      ? 'bg-neon-500/15 text-neon-500 border border-neon-500/30'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>🌟 All Products</span>
                  <span className="text-xs opacity-60">{products.length}</span>
                </button>
                {categories.map((cat: any) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.slug)}
                    data-testid={`category-${cat.slug}`}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-between ${
                      selectedCategory === cat.slug
                        ? 'bg-neon-500/15 text-neon-500 border border-neon-500/30'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>{cat.icon} {cat.name}</span>
                    <span className="text-xs opacity-60">{cat.product_count}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.aside>

          <div className="flex-1">
            <div className="relative mb-6">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-gold w-full pl-10 pr-4 py-3 text-sm"
                data-testid="input-search"
              />
            </div>

            {loading ? (
              <div className="flex justify-center py-24"><div className="spinner" /></div>
            ) : products.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
                <span className="text-6xl mb-4 block">🔍</span>
                <h3 className="text-white font-semibold text-xl mb-2">No products found</h3>
                <p className="text-gray-500 text-sm">Try a different search or category</p>
              </motion.div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-500 text-sm">{products.length} product{products.length !== 1 ? 's' : ''} found</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {products.map((product: any, i: number) => (
                    <ProductCard key={product.id} product={product} index={i} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

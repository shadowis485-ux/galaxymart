import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Zap, Package, ChevronLeft, Check, Minus, Plus, Shield, Clock, Star, AlertCircle } from 'lucide-react';
import { productsApi } from '../lib/api';
import { useCart } from '../lib/cart';
import { useLocation, useParams } from 'wouter';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [imgError, setImgError] = useState(false);
  const { addItem } = useCart();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!id) { navigate('/products'); return; }
    setLoading(true);
    productsApi.getById(Number(id))
      .then((p: any) => setProduct(p))
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="spinner" /></div>;
  }

  if (!product) return null;

  const inStock = (product.available_stock ?? product.stock_count) > 0;
  const stock = product.available_stock ?? product.stock_count;
  const maxQty = Math.min(stock, 10);

  const bullets = product.bullet_points
    ? product.bullet_points.split('\n').filter((b: string) => b.trim())
    : product.description
      ? product.description.split('\n').filter((b: string) => b.trim())
      : [];

  const handleAddToCart = () => {
    if (!inStock) { toast.error('Out of stock'); return; }
    for (let i = 0; i < quantity; i++) addItem(product);
    toast.success(`${quantity}x ${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    if (!inStock) { toast.error('Out of stock'); return; }
    addItem({ ...product }, quantity);
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.button initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/products')}
        className="flex items-center gap-2 text-gray-500 hover:text-neon-500 transition-colors mb-8 text-sm group"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Products
      </motion.button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#0d1a0d] to-[#050505] border border-neon-500/15 aspect-square flex items-center justify-center">
            {product.image_url && !imgError ? (
              <img src={product.image_url} alt={product.name} onError={() => setImgError(true)} className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-4 p-12">
                <Package size={80} className="text-neon-500/20" />
                <span className="text-gray-600 text-sm">No image available</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            {!inStock && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <span className="text-red-400 font-bold tracking-widest uppercase border border-red-400/30 px-5 py-2 rounded bg-red-400/10">Out of Stock</span>
              </div>
            )}
            {product.featured === 1 && inStock && (
              <div className="absolute top-4 right-4"><span className="tag-green text-xs tracking-wider">★ FEATURED</span></div>
            )}
            {product.category_name && (
              <div className="absolute top-4 left-4">
                <span className="text-xs px-3 py-1 rounded-full bg-black/60 border border-white/10 text-gray-300">{product.category_name}</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[{ icon: Zap, label: 'Instant Delivery' }, { icon: Shield, label: '100% Secure' }, { icon: Clock, label: '24/7 Support' }].map((item, i) => (
              <div key={i} className="glass-card p-3 flex flex-col items-center gap-1 text-center">
                <item.icon size={16} className="text-neon-500" />
                <span className="text-gray-500 text-[10px]">{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="flex flex-col">
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mb-3 leading-tight">{product.name}</h1>
          <div className="flex items-center gap-2 mb-5">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(i => <Star key={i} size={14} className="text-yellow-400" fill="#facc15" />)}
            </div>
            <span className="text-gray-500 text-sm">5.0 (verified)</span>
          </div>

          <div className="glass-card p-5 mb-6 border border-neon-500/20">
            <div className="flex items-end justify-between mb-2">
              <div>
                <span className="text-gray-500 text-sm block mb-1">Price</span>
                <span className="text-4xl font-bold text-neon-500 font-mono">${product.price.toFixed(2)}</span>
              </div>
              <div className="text-right">
                <span className={`text-sm font-medium px-3 py-1 rounded-full ${inStock ? 'text-neon-500 bg-neon-500/10 border border-neon-500/25' : 'text-red-400 bg-red-400/10 border border-red-400/25'}`}>
                  {inStock ? `${stock} in stock` : 'Out of Stock'}
                </span>
              </div>
            </div>
            <p className="text-gray-600 text-xs">Payment via Litecoin (LTC) — instant & anonymous</p>
          </div>

          {bullets.length > 0 && (
            <div className="mb-6">
              <h3 className="text-gray-400 font-semibold mb-3 text-sm uppercase tracking-wider">What's Included</h3>
              <ul className="space-y-2">
                {bullets.map((bullet: string, i: number) => {
                  const text = bullet.replace(/^[•\-\*]\s*/, '');
                  return (
                    <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.05 }} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-neon-500/15 border border-neon-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={11} className="text-neon-500" />
                      </div>
                      <span className="text-gray-300 text-sm leading-relaxed">{text}</span>
                    </motion.li>
                  );
                })}
              </ul>
            </div>
          )}

          {inStock && (
            <div className="mb-6">
              <label className="text-gray-400 text-xs mb-3 block uppercase tracking-wider">Quantity</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-0">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1} className="qty-btn rounded-r-none disabled:opacity-40">
                    <Minus size={14} />
                  </button>
                  <div className="w-14 h-9 bg-neon-500/5 border-y border-neon-500/25 flex items-center justify-center">
                    <span className="text-white font-bold font-mono">{quantity}</span>
                  </div>
                  <button onClick={() => setQuantity(q => Math.min(maxQty, q + 1))} disabled={quantity >= maxQty} className="qty-btn rounded-l-none disabled:opacity-40">
                    <Plus size={14} />
                  </button>
                </div>
                <span className="text-gray-600 text-sm">
                  Total: <span className="text-neon-500 font-bold font-mono">${(product.price * quantity).toFixed(2)}</span>
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <button onClick={handleAddToCart} disabled={!inStock}
              className={`flex-1 flex items-center justify-center gap-2.5 py-4 rounded-xl text-sm font-bold transition-all ${inStock ? 'btn-green' : 'bg-gray-900 text-gray-600 cursor-not-allowed border border-gray-800'}`}
              data-testid="button-add-to-cart"
            >
              <span><ShoppingCart size={16} /></span>
              <span>Add to Cart</span>
            </button>
            <button onClick={handleBuyNow} disabled={!inStock}
              className={`flex-1 flex items-center justify-center gap-2.5 py-4 rounded-xl text-sm font-bold transition-all ${inStock ? 'btn-green-solid hover:shadow-[0_0_30px_rgba(0,255,65,0.4)]' : 'bg-gray-900 text-gray-600 cursor-not-allowed border border-gray-800'}`}
              data-testid="button-buy-now"
            >
              <Zap size={16} />
              Buy Now
            </button>
          </div>

          {!inStock && (
            <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/5 border border-red-500/20 text-red-400 text-sm">
              <AlertCircle size={16} />
              This product is currently out of stock. Check back soon.
            </div>
          )}

          <div className="glass-card p-4 text-sm text-gray-500">
            <p className="flex items-center gap-2 mb-1">
              <Zap size={13} className="text-neon-500" />
              Delivered automatically to your email after payment
            </p>
            <p className="flex items-center gap-2">
              <Shield size={13} className="text-neon-500" />
              Secured by Litecoin blockchain — no chargebacks
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

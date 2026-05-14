import { motion } from 'framer-motion';
import { ShoppingCart, Package, Zap } from 'lucide-react';
import { useCart } from '../lib/cart';
import { useLocation } from 'wouter';
import toast from 'react-hot-toast';
import { fmtLTC } from '../lib/utils';

interface ProductCardProps {
  product: any;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCart();
  const [, navigate] = useLocation();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!inStock) { toast.error('Out of stock'); return; }
    addItem(product);
    toast.success(`Added to cart!`);
  };

  const handleOpen = () => {
    navigate(`/products/${product.id}`);
  };

  const inStock = (product.available_stock ?? product.stock_count) > 0;
  const stock = product.available_stock ?? product.stock_count;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      className="product-card group"
      onClick={handleOpen}
      data-testid={`card-product-${product.id}`}
    >
      <div className="relative h-40 bg-gradient-to-br from-[#0d1a0d] to-[#050505] overflow-hidden flex items-center justify-center">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500"
          />
        ) : (
          <Package size={44} className="text-neon-500/20 group-hover:text-neon-500/40 transition-colors duration-300" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        {!inStock && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <span className="text-red-400 text-xs font-bold tracking-widest uppercase border border-red-400/30 px-3 py-1 rounded bg-red-400/10">
              Out of Stock
            </span>
          </div>
        )}

        {product.featured === 1 && inStock && (
          <div className="absolute top-2 right-2">
            <span className="tag-green text-[10px] tracking-wider">FEATURED</span>
          </div>
        )}

        <div className="absolute bottom-2 left-2">
          <span className="price-badge px-2 py-0.5 rounded text-sm font-bold font-mono tracking-tight">
            {fmtLTC(product.price)}
          </span>
        </div>
      </div>

      <div className="p-3">
        <h3 className="text-white text-sm font-semibold leading-tight mb-1 group-hover:text-neon-500 transition-colors line-clamp-2">
          {product.name}
        </h3>

        <div className="flex items-center justify-between mb-3">
          {product.category_name && (
            <span className="text-gray-600 text-[10px] uppercase tracking-wider">{product.category_name}</span>
          )}
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ml-auto ${inStock ? 'text-neon-500 bg-neon-500/8' : 'text-red-400 bg-red-400/8'}`}>
            {inStock ? `${stock} left` : 'Sold out'}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            data-testid={`button-add-cart-${product.id}`}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded text-xs font-bold transition-all duration-200 ${
              inStock ? 'btn-green' : 'bg-gray-900 text-gray-600 cursor-not-allowed border border-gray-800'
            }`}
          >
            <span><ShoppingCart size={12} /></span>
            <span>Add to Cart</span>
          </button>
          {inStock && (
            <button
              onClick={(e) => { e.stopPropagation(); handleOpen(); }}
              className="px-3 py-2 rounded text-xs font-bold btn-green-solid"
              data-testid={`button-buy-now-${product.id}`}
            >
              <Zap size={12} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Package } from 'lucide-react';
import { useCart } from '../lib/cart';

export default function Cart({ setPage }) {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-12"
        >
          <ShoppingCart size={80} className="mx-auto text-gray-700 mb-6" />
          <h2 className="text-3xl font-display font-bold text-white mb-3">Your Cart is Empty</h2>
          <p className="text-gray-500 mb-8">Add some premium products to get started!</p>
          <button
            onClick={() => setPage('products')}
            className="btn-gold px-8 py-3 rounded-xl font-bold"
            data-testid="button-browse-empty-cart"
          >
            Browse Products
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-display font-bold text-white mb-2">
          Shopping <span className="gold-text">Cart</span>
        </h1>
        <p className="text-gray-500">{items.length} item{items.length !== 1 ? 's' : ''} in your cart</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {items.map((item, i) => (
              <motion.div
                key={item.product_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-5 flex gap-4"
                data-testid={`cart-item-${item.product_id}`}
              >
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-yellow-900/30 to-black flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package size={30} className="text-yellow-600" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-sm mb-1 truncate">{item.name}</h3>
                  <p className="text-yellow-400 font-bold text-lg">${item.price.toFixed(2)}</p>

                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-2 bg-white/5 rounded-lg border border-white/10">
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        className="p-1.5 hover:text-yellow-400 transition-colors"
                        data-testid={`button-decrease-${item.product_id}`}
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-white text-sm font-medium w-6 text-center" data-testid={`text-quantity-${item.product_id}`}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        className="p-1.5 hover:text-yellow-400 transition-colors"
                        data-testid={`button-increase-${item.product_id}`}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.product_id)}
                      className="p-1.5 text-gray-600 hover:text-red-400 transition-colors"
                      data-testid={`button-remove-${item.product_id}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-white font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <button
            onClick={clearCart}
            className="text-gray-500 hover:text-red-400 text-sm transition-colors flex items-center gap-1"
            data-testid="button-clear-cart"
          >
            <Trash2 size={14} />
            Clear cart
          </button>
        </div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 h-fit sticky top-24"
        >
          <h3 className="text-white font-bold text-lg mb-5">Order Summary</h3>

          <div className="space-y-3 mb-5">
            {items.map(item => (
              <div key={item.product_id} className="flex justify-between text-sm">
                <span className="text-gray-400 truncate mr-2">{item.name} x{item.quantity}</span>
                <span className="text-white font-medium flex-shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-300 font-medium">Total</span>
              <span className="text-2xl font-bold gold-text">${total.toFixed(2)}</span>
            </div>
            <p className="text-gray-600 text-xs mt-1">Paid in Litecoin (LTC)</p>
          </div>

          <button
            onClick={() => setPage('checkout')}
            className="btn-gold w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-base"
            data-testid="button-checkout"
          >
            Proceed to Checkout
            <ArrowRight size={18} />
          </button>

          <button
            onClick={() => setPage('products')}
            className="w-full mt-3 py-2.5 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Continue Shopping
          </button>
        </motion.div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle, Clock, AlertCircle, RefreshCw, Package, Mail } from 'lucide-react';
import { ordersApi } from '../lib/api';
import toast from 'react-hot-toast';
import Footer from '../components/Footer';

const STATUS_CONFIG = {
  pending: { icon: Clock, label: 'Waiting for Payment', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20' },
  confirming: { icon: RefreshCw, label: 'Confirming Payment', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20' },
  confirmed: { icon: CheckCircle, label: 'Payment Confirmed', color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/20' },
  failed: { icon: AlertCircle, label: 'Payment Failed', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/20' },
  expired: { icon: AlertCircle, label: 'Invoice Expired', color: 'text-gray-400', bg: 'bg-gray-400/10 border-gray-400/20' },
};

export default function OrderStatus() {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!orderId.trim()) {
      toast.error('Please enter an order ID');
      return;
    }
    setLoading(true);
    try {
      const data = await ordersApi.getStatus(orderId.trim());
      setOrder(data);
    } catch (err) {
      toast.error('Order not found');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const statusInfo = order ? (STATUS_CONFIG[order.payment_status] || STATUS_CONFIG.pending) : null;

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-4xl font-display font-bold text-white mb-3">Order <span className="gold-text">Status</span></h1>
          <p className="text-gray-500">Track your order status and delivery</p>
        </motion.div>

        <div className="glass-card p-6 mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={orderId}
              onChange={e => setOrderId(e.target.value)}
              placeholder="Enter your Order ID..."
              className="input-gold flex-1 px-4 py-3 text-sm"
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              data-testid="input-order-id"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="btn-gold px-6 py-3 rounded-xl font-bold flex items-center gap-2"
              data-testid="button-search-order"
            >
              {loading ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />}
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {order && statusInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className={`glass-card p-5 border ${statusInfo.bg}`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full ${statusInfo.bg} flex items-center justify-center`}>
                  <statusInfo.icon size={24} className={statusInfo.color} />
                </div>
                <div>
                  <p className={`font-bold text-lg ${statusInfo.color}`}>{statusInfo.label}</p>
                  <p className="text-gray-500 text-sm">Payment: {order.payment_currency?.toUpperCase() || 'LTC'}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-white font-bold text-lg">${order.total_amount?.toFixed(2)}</p>
                  <p className={`text-xs px-2 py-0.5 rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
                    {order.delivery_status === 'delivered' ? '✓ Delivered' : 'Pending delivery'}
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-card p-5 space-y-3">
              <h3 className="text-white font-semibold mb-3">Order Details</h3>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Order ID</span>
                <span className="text-white font-mono text-xs">{order.id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Email</span>
                <span className="text-yellow-400 flex items-center gap-1"><Mail size={13} />{order.customer_email}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Date</span>
                <span className="text-white">{new Date(order.created_at).toLocaleString()}</span>
              </div>
            </div>

            <div className="glass-card p-5">
              <h3 className="text-white font-semibold mb-4">Items Ordered</h3>
              <div className="space-y-3">
                {(order.items || []).map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                    <div className="w-9 h-9 rounded-lg bg-yellow-400/10 flex items-center justify-center">
                      <Package size={16} className="text-yellow-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{item.name}</p>
                      <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-yellow-400 text-sm font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            {order.delivery_status === 'delivered' && (
              <div className="glass-card p-4 border border-green-400/20 bg-green-400/5 text-center">
                <CheckCircle size={20} className="text-green-400 mx-auto mb-2" />
                <p className="text-green-400 font-medium text-sm">Products delivered to your email</p>
              </div>
            )}
          </motion.div>
        )}

        {!order && !loading && (
          <div className="text-center py-10 text-gray-600">
            <Search size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Enter your order ID to check status</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

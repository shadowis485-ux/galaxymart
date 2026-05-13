import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mail, Copy, Check, Clock, Zap, AlertCircle, CheckCircle, RefreshCw, Package } from 'lucide-react';
import { useCart } from '../lib/cart';
import { ordersApi, paymentsApi } from '../lib/api';
import { useLocation } from 'wouter';
import toast from 'react-hot-toast';

const STATUS_INFO: any = {
  pending:    { label: 'Waiting for Payment',  color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30', icon: Clock },
  confirming: { label: 'Confirming Payment',   color: 'text-blue-400',   bg: 'bg-blue-400/10 border-blue-400/30',    icon: RefreshCw },
  confirmed:  { label: 'Payment Confirmed!',   color: 'text-green-400',  bg: 'bg-green-400/10 border-green-400/30',  icon: CheckCircle },
  failed:     { label: 'Payment Failed',       color: 'text-red-400',    bg: 'bg-red-400/10 border-red-400/30',      icon: AlertCircle },
  expired:    { label: 'Invoice Expired',      color: 'text-gray-400',   bg: 'bg-gray-400/10 border-gray-400/30',    icon: AlertCircle },
};

function CopyButton({ text, label }: any) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="flex items-center gap-1 text-neon-500 hover:text-neon-400 text-xs transition-colors" data-testid={`button-copy-${label}`}>
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

function CountdownTimer({ seconds }: any) {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    if (remaining <= 0) return;
    const t = setTimeout(() => setRemaining((r: number) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining]);
  const m = Math.floor(remaining / 60);
  const s = remaining % 60;
  return <span className={remaining < 120 ? 'text-red-400' : 'text-yellow-400'}>{m}:{s.toString().padStart(2, '0')}</span>;
}

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState('email');
  const [order, setOrder] = useState<any>(null);
  const [status, setStatus] = useState('pending');
  const [loading, setLoading] = useState(false);
  const pollRef = useRef<any>(null);
  const [, navigate] = useLocation();

  useEffect(() => {
    if (items.length === 0 && step !== 'success') navigate('/cart');
  }, [items]);

  useEffect(() => {
    if (order && status === 'pending') {
      pollRef.current = setInterval(async () => {
        try {
          const data: any = await ordersApi.getStatus(order.order_id);
          setStatus(data.payment_status);
          if (['confirmed', 'failed', 'expired'].includes(data.payment_status)) {
            clearInterval(pollRef.current);
            if (data.payment_status === 'confirmed') { setStep('success'); clearCart(); }
          }
        } catch {}
      }, 5000);
    }
    return () => clearInterval(pollRef.current);
  }, [order, status]);

  const handleCreateOrder = async () => {
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) { toast.error('Please enter a valid email address'); return; }
    setLoading(true);
    try {
      const result: any = await ordersApi.create({
        customer_email: email,
        items: items.map((i: any) => ({ product_id: i.product_id, quantity: i.quantity })),
      });
      setOrder(result);
      setStep('payment');
      toast.success('Invoice created!');
    } catch (err: any) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const handleMockConfirm = async () => {
    if (!order) return;
    try {
      await paymentsApi.mockConfirm(order.order_id);
      setStatus('confirmed'); setStep('success'); clearCart();
      toast.success('Payment confirmed! (Demo mode)');
    } catch (err: any) { toast.error(err.message); }
  };

  const paymentInfo = STATUS_INFO[status] || STATUS_INFO.pending;

  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-12 text-center max-w-lg w-full">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
            className="w-24 h-24 rounded-full bg-green-400/10 border-2 border-green-400/30 flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle size={48} className="text-green-400" />
          </motion.div>
          <h2 className="text-3xl font-display font-bold text-white mb-3">Order Delivered!</h2>
          <p className="text-gray-400 mb-2">Your products have been sent to</p>
          <p className="text-neon-500 font-medium mb-6">{email}</p>
          <p className="text-gray-500 text-sm mb-8">Check your inbox (and spam folder) for your license keys.</p>
          <div className="flex flex-col gap-3">
            <button onClick={() => navigate('/products')} className="btn-gold py-3 rounded-xl font-bold" data-testid="button-continue-shopping">Continue Shopping</button>
            <button onClick={() => navigate('/status')} className="text-gray-400 hover:text-white text-sm transition-colors">Check Order Status</button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-4xl font-display font-bold text-white mb-2">Checkout</h1>
        <p className="text-gray-500">Complete your purchase with Litecoin (LTC)</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {step === 'email' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
              <h3 className="text-white font-semibold text-lg mb-5 flex items-center gap-2">
                <Mail size={18} className="text-neon-500" />
                Delivery Email
              </h3>
              <div className="mb-4">
                <label className="text-gray-400 text-sm mb-2 block">Your email address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com" className="input-gold w-full px-4 py-3"
                  onKeyDown={e => e.key === 'Enter' && handleCreateOrder()}
                  data-testid="input-email"
                />
                <p className="text-gray-600 text-xs mt-2">Your digital products will be delivered here instantly after payment.</p>
              </div>
              <button onClick={handleCreateOrder} disabled={loading}
                className="btn-gold w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2"
                data-testid="button-create-invoice"
              >
                {loading ? <RefreshCw size={18} className="animate-spin" /> : <Zap size={18} />}
                {loading ? 'Creating Invoice...' : 'Create Payment Invoice'}
              </button>
            </motion.div>
          )}

          {step === 'payment' && order && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className={`glass-card p-5 border ${paymentInfo.bg}`}>
                <div className="flex items-center gap-3">
                  <paymentInfo.icon size={22} className={`${paymentInfo.color} ${status === 'confirming' ? 'animate-spin' : ''}`} />
                  <div>
                    <p className={`font-semibold ${paymentInfo.color}`}>{paymentInfo.label}</p>
                    <p className="text-gray-500 text-sm">Order ID: {order.order_id}</p>
                  </div>
                  {status === 'pending' && (
                    <div className="ml-auto text-right">
                      <p className="text-gray-500 text-xs mb-1">Expires in</p>
                      <CountdownTimer seconds={1800} />
                    </div>
                  )}
                </div>
              </div>

              {status === 'pending' && order.payment && (
                <div className="glass-card p-6">
                  <h3 className="text-white font-semibold text-lg mb-5">Payment Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-gray-500 text-xs uppercase tracking-wider mb-1 block">Send exactly</label>
                      <div className="flex items-center justify-between bg-black/40 border border-neon-500/20 rounded-xl p-4">
                        <div>
                          <p className="text-3xl font-bold gold-text">{order.payment.pay_amount}</p>
                          <p className="text-gray-500 text-sm">LTC (Litecoin)</p>
                        </div>
                        <CopyButton text={String(order.payment.pay_amount)} label="amount" />
                      </div>
                    </div>
                    <div>
                      <label className="text-gray-500 text-xs uppercase tracking-wider mb-1 block">To this address</label>
                      <div className="flex items-center justify-between bg-black/40 border border-neon-500/20 rounded-xl p-4 gap-3">
                        <p className="text-white text-sm font-mono break-all">{order.payment.pay_address}</p>
                        <CopyButton text={order.payment.pay_address} label="address" />
                      </div>
                    </div>
                    <div className="bg-neon-500/5 border border-neon-500/20 rounded-xl p-4">
                      <p className="text-neon-500 text-sm font-medium mb-1">Important</p>
                      <ul className="text-gray-400 text-xs space-y-1">
                        <li>• Send the exact amount shown above</li>
                        <li>• Payment is automatically detected</li>
                        <li>• Products delivered instantly after confirmation</li>
                        <li>• Use only LTC (Litecoin) network</li>
                      </ul>
                    </div>
                    {order.payment.mock && (
                      <div className="border-t border-white/10 pt-4">
                        <p className="text-gray-500 text-xs mb-3 text-center">Demo Mode — no real payment needed</p>
                        <button onClick={handleMockConfirm} className="btn-gold w-full py-3 rounded-xl font-bold text-sm" data-testid="button-mock-confirm">
                          Simulate Payment Confirmation
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {['confirmed','failed','expired'].includes(status) && (
                <div className="glass-card p-6 text-center">
                  <paymentInfo.icon size={48} className={`${paymentInfo.color} mx-auto mb-4`} />
                  <p className={`font-bold text-xl mb-4 ${paymentInfo.color}`}>{paymentInfo.label}</p>
                  {status !== 'confirmed' && (
                    <button onClick={() => navigate('/products')} className="btn-gold px-8 py-3 rounded-xl font-bold">Try Again</button>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </div>

        <div className="glass-card p-5 h-fit">
          <h3 className="text-white font-bold mb-4">Order Summary</h3>
          <div className="space-y-3 mb-4">
            {items.map((item: any) => (
              <div key={item.product_id} className="flex gap-2 items-start">
                <div className="w-10 h-10 rounded-lg bg-neon-900/20 flex items-center justify-center flex-shrink-0">
                  <Package size={16} className="text-neon-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium truncate">{item.name}</p>
                  <p className="text-gray-500 text-xs">x{item.quantity}</p>
                </div>
                <p className="text-neon-500 text-xs font-bold flex-shrink-0">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300 text-sm">Total</span>
              <span className="text-xl font-bold gold-text">${total.toFixed(2)}</span>
            </div>
            <p className="text-gray-600 text-xs mt-1">≈ {order?.payment?.pay_amount || '...'} LTC</p>
          </div>
          {email && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <p className="text-gray-500 text-xs">Delivering to</p>
              <p className="text-neon-500 text-xs font-medium break-all">{email}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

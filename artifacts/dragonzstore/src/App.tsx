import { Router, Route, Switch } from 'wouter';
import { CartContext, useCartStore } from './lib/cart';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Reviews from './pages/Reviews';
import Terms from './pages/Terms';
import OrderStatus from './pages/OrderStatus';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import NetworkBackground from './components/NetworkBackground';
import { Toaster } from 'react-hot-toast';

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';

export default function App() {
  const cart = useCartStore();

  return (
    <CartContext.Provider value={cart}>
      <Router base={BASE}>
        <div className="min-h-screen bg-[#05090f] relative">
          <NetworkBackground />
          {/* Grid overlay */}
          <div className="fixed inset-0 z-0 pointer-events-none grid-bg" />
          <div className="scan-line" />
          {/* Blue glow orbs */}
          <div className="glow-orb" style={{ width: 600, height: 600, background: '#3b82f6', top: '-220px', right: '-180px' }} />
          <div className="glow-orb" style={{ width: 400, height: 400, background: '#6366f1', bottom: '15%', left: '-140px' }} />
          <div className="glow-orb" style={{ width: 300, height: 300, background: '#2563eb', top: '40%', right: '20%', opacity: 0.04 }} />
          <div className="relative z-10">
            <Navbar />
            <main>
              <Switch>
                <Route path="/" component={Home} />
                <Route path="/products" component={Products} />
                <Route path="/products/:id" component={ProductDetail} />
                <Route path="/cart" component={Cart} />
                <Route path="/checkout" component={Checkout} />
                <Route path="/reviews" component={Reviews} />
                <Route path="/terms" component={Terms} />
                <Route path="/status" component={OrderStatus} />
                <Route path="/admin/login" component={AdminLogin} />
                <Route path="/admin" component={AdminDashboard} />
                <Route component={Home} />
              </Switch>
            </main>
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#0a1020',
                color: '#fff',
                border: '1px solid rgba(59,130,246,0.25)',
                borderRadius: '12px',
                fontSize: '13px',
                fontFamily: 'Inter, sans-serif',
              },
              success: { iconTheme: { primary: '#60a5fa', secondary: '#0a1020' } },
              error:   { iconTheme: { primary: '#f87171', secondary: '#0a1020' } },
            }}
          />
        </div>
      </Router>
    </CartContext.Provider>
  );
}

import { useState, useEffect } from 'react';
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

function Router({ page, setPage, orderData, setOrderData, selectedProduct, setSelectedProduct }) {
  switch (page) {
    case 'home': return <Home setPage={setPage} setSelectedProduct={setSelectedProduct} />;
    case 'products': return <Products setPage={setPage} setSelectedProduct={setSelectedProduct} />;
    case 'product-detail': return <ProductDetail product={selectedProduct} setPage={setPage} setOrderData={setOrderData} />;
    case 'cart': return <Cart setPage={setPage} setOrderData={setOrderData} />;
    case 'checkout': return <Checkout setPage={setPage} orderData={orderData} setOrderData={setOrderData} />;
    case 'reviews': return <Reviews />;
    case 'terms': return <Terms />;
    case 'status': return <OrderStatus />;
    case 'admin-login': return <AdminLogin setPage={setPage} />;
    case 'admin': return <AdminDashboard setPage={setPage} />;
    default: return <Home setPage={setPage} setSelectedProduct={setSelectedProduct} />;
  }
}

export default function App() {
  const [page, setPage] = useState('home');
  const [orderData, setOrderData] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const cart = useCartStore();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  return (
    <CartContext.Provider value={cart}>
      <div className="min-h-screen bg-[#050505] relative">
        <NetworkBackground />
        <div className="scan-line" />
        <div className="glow-orb" style={{ width: 500, height: 500, background: '#00ff41', top: '-200px', right: '-150px' }} />
        <div className="glow-orb" style={{ width: 350, height: 350, background: '#00cc33', bottom: '20%', left: '-120px' }} />
        <div className="relative z-10">
          <Navbar page={page} setPage={setPage} />
          <main>
            <Router
              page={page} setPage={setPage}
              orderData={orderData} setOrderData={setOrderData}
              selectedProduct={selectedProduct} setSelectedProduct={setSelectedProduct}
            />
          </main>
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0d0d0d',
              color: '#fff',
              border: '1px solid rgba(0,255,65,0.25)',
              borderRadius: '8px',
              fontSize: '13px',
              fontFamily: 'Inter, sans-serif',
            },
            success: { iconTheme: { primary: '#00ff41', secondary: '#000' } },
            error: { iconTheme: { primary: '#f87171', secondary: '#000' } },
          }}
        />
      </div>
    </CartContext.Provider>
  );
}

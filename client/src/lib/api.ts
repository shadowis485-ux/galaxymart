import axios from 'axios';

// Mock data for when API is unavailable
const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "Premium Game Pass Ultimate",
    description: "Access to 100+ high-quality games on console, PC, and cloud. Includes EA Play membership.",
    price: 14.99,
    image_url: "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=400&h=300&fit=crop",
    category_name: "Gaming",
    category_slug: "gaming",
    available_stock: 50,
    stock_count: 50,
    featured: 1,
  },
  {
    id: 2,
    name: "Netflix Premium 1 Month",
    description: "Ultra HD streaming on 4 screens simultaneously. Download on 6 devices.",
    price: 9.99,
    image_url: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400&h=300&fit=crop",
    category_name: "Streaming",
    category_slug: "streaming",
    available_stock: 100,
    stock_count: 100,
    featured: 1,
  },
  {
    id: 3,
    name: "Spotify Premium 3 Months",
    description: "Ad-free music, offline listening, and high-quality audio streaming.",
    price: 19.99,
    image_url: "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=400&h=300&fit=crop",
    category_name: "Streaming",
    category_slug: "streaming",
    available_stock: 75,
    stock_count: 75,
    featured: 1,
  },
  {
    id: 4,
    name: "Discord Nitro 1 Month",
    description: "Boost your Discord experience with custom emojis, HD streaming, and more.",
    price: 8.99,
    image_url: "https://images.unsplash.com/photo-1614680376408-81e91ffe3db7?w=400&h=300&fit=crop",
    category_name: "Software",
    category_slug: "software",
    available_stock: 200,
    stock_count: 200,
    featured: 1,
  },
  {
    id: 5,
    name: "Steam Wallet $50",
    description: "Add funds to your Steam wallet for games, DLC, and in-game purchases.",
    price: 45.99,
    image_url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop",
    category_name: "Gaming",
    category_slug: "gaming",
    available_stock: 30,
    stock_count: 30,
    featured: 0,
  },
  {
    id: 6,
    name: "YouTube Premium 1 Month",
    description: "Ad-free videos, background play, and YouTube Music Premium included.",
    price: 11.99,
    image_url: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400&h=300&fit=crop",
    category_name: "Streaming",
    category_slug: "streaming",
    available_stock: 150,
    stock_count: 150,
    featured: 0,
  },
  {
    id: 7,
    name: "VPN Premium 1 Year",
    description: "Secure, fast VPN with servers in 90+ countries. No logs policy.",
    price: 39.99,
    image_url: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop",
    category_name: "Software",
    category_slug: "software",
    available_stock: 80,
    stock_count: 80,
    featured: 0,
  },
  {
    id: 8,
    name: "Adobe Creative Cloud 1 Month",
    description: "Access to Photoshop, Illustrator, Premiere Pro, and 20+ creative apps.",
    price: 29.99,
    image_url: "https://images.unsplash.com/photo-1626785774625-0b1c2c4eab67?w=400&h=300&fit=crop",
    category_name: "Software",
    category_slug: "software",
    available_stock: 25,
    stock_count: 25,
    featured: 0,
  },
];

const MOCK_CATEGORIES = [
  { id: 1, name: "Gaming", slug: "gaming", icon: "🎮", product_count: 2 },
  { id: 2, name: "Streaming", slug: "streaming", icon: "📺", product_count: 3 },
  { id: 3, name: "Software", slug: "software", icon: "💻", product_count: 3 },
];

const MOCK_REVIEWS = [
  { id: 1, name: "Alex M.", rating: 5, comment: "Amazing service! Got my product instantly. Will definitely buy again.", created_at: "2024-01-15" },
  { id: 2, name: "Sarah K.", rating: 5, comment: "Best prices I've found anywhere. Super fast delivery.", created_at: "2024-01-14" },
  { id: 3, name: "Mike R.", rating: 5, comment: "Customer support is incredible. They helped me right away.", created_at: "2024-01-13" },
  { id: 4, name: "Emma L.", rating: 5, comment: "Legit and reliable. My go-to shop now!", created_at: "2024-01-12" },
  { id: 5, name: "Chris P.", rating: 5, comment: "Fast, cheap, and trustworthy. What more could you ask for?", created_at: "2024-01-11" },
  { id: 6, name: "Jordan T.", rating: 5, comment: "Been buying here for months. Never had any issues.", created_at: "2024-01-10" },
];

// In production (Vercel), point to the API serverless function.
// VITE_API_URL lets you override with an external API host if needed.
const BASE_URL = (import.meta.env.VITE_API_URL || '') + '/api';

const api = axios.create({ baseURL: BASE_URL, timeout: 15000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r.data as any,
  (error) =>
    Promise.reject(
      new Error(
        error.response?.data?.error || error.message || 'Network error',
      ),
    ),
);

// Helper to handle API calls with fallback to mock data
async function withMockFallback<T>(apiCall: () => Promise<T>, mockData: T): Promise<T> {
  try {
    return await apiCall();
  } catch {
    console.warn('API unavailable, using mock data');
    return mockData;
  }
}

export const productsApi = {
  getAll: (params?: any) => withMockFallback(
    () => api.get('/products', { params }),
    (() => {
      let products = [...MOCK_PRODUCTS];
      if (params?.featured === 'true') {
        products = products.filter(p => p.featured === 1);
      }
      if (params?.category && params.category !== 'all') {
        products = products.filter(p => p.category_slug === params.category);
      }
      if (params?.search) {
        const search = params.search.toLowerCase();
        products = products.filter(p => p.name.toLowerCase().includes(search));
      }
      return products;
    })()
  ),
  getById: (id: number) => withMockFallback(
    () => api.get(`/products/${id}`),
    MOCK_PRODUCTS.find(p => p.id === id) || MOCK_PRODUCTS[0]
  ),
  getStats: () => withMockFallback(
    () => api.get('/products/stats'),
    { total: MOCK_PRODUCTS.length, inStock: MOCK_PRODUCTS.length }
  ),
  create: (data: FormData) =>
    api.post('/products', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id: number, data: FormData) =>
    api.put(`/products/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id: number) => api.delete(`/products/${id}`),
};

export const categoriesApi = {
  getAll: () => withMockFallback(
    () => api.get('/categories'),
    MOCK_CATEGORIES
  ),
  create: (data: any) => api.post('/categories', data),
  delete: (id: number) => api.delete(`/categories/${id}`),
};

export const ordersApi = {
  create: (data: any) => api.post('/orders', data),
  getStatus: (orderId: string) => withMockFallback(
    () => api.get(`/orders/status/${orderId}`),
    { status: 'pending', order_id: orderId, message: 'Order is being processed' }
  ),
  getAll: (params?: any) => withMockFallback(
    () => api.get('/orders', { params }),
    []
  ),
  getAnalytics: () => withMockFallback(
    () => api.get('/orders/analytics'),
    { total_orders: 0, total_revenue: 0, pending_orders: 0 }
  ),
  search: (q: string) => withMockFallback(
    () => api.get('/orders/search', { params: { q } }),
    []
  ),
  getDetail: (orderId: string) => withMockFallback(
    () => api.get(`/orders/detail/${orderId}`),
    null
  ),
};

export const reviewsApi = {
  getAll: () => withMockFallback(
    () => api.get('/reviews'),
    MOCK_REVIEWS
  ),
  create: (data: any) => api.post('/reviews', data),
  delete: (id: number) => api.delete(`/reviews/${id}`),
};

export const stockApi = {
  add: (data: any) => api.post('/stock/add', data),
  getByProduct: (productId: string | number) => withMockFallback(
    () => api.get(`/stock/${productId}`),
    []
  ),
  delete: (id: number) => api.delete(`/stock/${id}`),
};

export const authApi = {
  login: ({ password }: { password: string }) =>
    api.post('/auth/login', { password }),
  me: () => api.get('/auth/me'),
};

export const paymentsApi = {
  mockConfirm: (orderId: string) =>
    api.post(`/payments/mock-confirm/${orderId}`),
};

export const ltcApi = {
  getActive: () => withMockFallback(
    () => api.get('/ltc/active'),
    { address: 'LTC_DEMO_ADDRESS_12345' }
  ),
  getAll: () => withMockFallback(
    () => api.get('/ltc'),
    []
  ),
  add: (data: any) => api.post('/ltc', data),
  activate: (id: number) => api.put(`/ltc/${id}/activate`),
  delete: (id: number) => api.delete(`/ltc/${id}`),
};

export default api;

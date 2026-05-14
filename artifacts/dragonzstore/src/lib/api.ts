import axios from 'axios';
import localStore from './localStore';

const BASE_URL = (import.meta.env.VITE_API_URL || '') + '/api';

const api = axios.create({ baseURL: BASE_URL, timeout: 8000 });

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

const isNetworkOrNotFound = (err: any) => {
  const msg = err?.message || '';
  return (
    msg.includes('404') ||
    msg.includes('Network Error') ||
    msg.includes('ERR_') ||
    msg.includes('timeout') ||
    msg.includes('network') ||
    err?.code === 'ERR_NETWORK' ||
    err?.code === 'ECONNREFUSED'
  );
};

async function tryApi<T>(call: () => Promise<T>, fallback: () => T): Promise<T> {
  try {
    return await call();
  } catch (err: any) {
    if (isNetworkOrNotFound(err)) {
      try { return fallback(); } catch (fbErr: any) { throw new Error(fbErr.message || String(fbErr)); }
    }
    throw err;
  }
}

export const productsApi = {
  getAll: (params?: any) =>
    tryApi(
      () => api.get('/products', { params }),
      () => localStore.getProducts(params),
    ),
  getById: (id: number) =>
    tryApi(
      () => api.get(`/products/${id}`),
      () => { const p = localStore.getProduct(id); if (!p) throw new Error('Product not found'); return p; },
    ),
  getStats: () =>
    tryApi(
      () => api.get('/products/stats'),
      () => localStore.getProductStats(),
    ),
  create: (data: FormData) =>
    tryApi(
      () => api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
      () => localStore.createProduct(data),
    ),
  update: (id: number, data: FormData) =>
    tryApi(
      () => api.put(`/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
      () => localStore.updateProduct(id, data),
    ),
  delete: (id: number) =>
    tryApi(
      () => api.delete(`/products/${id}`),
      () => localStore.deleteProduct(id),
    ),
};

export const categoriesApi = {
  getAll: () =>
    tryApi(
      () => api.get('/categories'),
      () => localStore.getCategories(),
    ),
  create: (data: any) =>
    tryApi(
      () => api.post('/categories', data),
      () => localStore.createCategory(data),
    ),
  delete: (id: number) =>
    tryApi(
      () => api.delete(`/categories/${id}`),
      () => localStore.deleteCategory(id),
    ),
};

export const ordersApi = {
  create: (data: any) => api.post('/orders', data),
  getStatus: (orderId: string) =>
    tryApi(
      () => api.get(`/orders/status/${orderId}`),
      () => { throw new Error('Order tracking requires a backend connection'); },
    ),
  getAll: (params?: any) =>
    tryApi(
      () => api.get('/orders', { params }),
      () => localStore.getOrders(params),
    ),
  getAnalytics: () =>
    tryApi(
      () => api.get('/orders/analytics'),
      () => localStore.getAnalytics(),
    ),
  search: (q: string) =>
    tryApi(
      () => api.get('/orders/search', { params: { q } }),
      () => localStore.searchOrders(q),
    ),
  getDetail: (orderId: string) =>
    tryApi(
      () => api.get(`/orders/detail/${orderId}`),
      () => { throw new Error('Order detail requires a backend connection'); },
    ),
};

export const reviewsApi = {
  getAll: () =>
    tryApi(
      () => api.get('/reviews'),
      () => localStore.getReviews(),
    ),
  create: (data: any) =>
    tryApi(
      () => api.post('/reviews', data),
      () => localStore.createReview(data),
    ),
  delete: (id: number) =>
    tryApi(
      () => api.delete(`/reviews/${id}`),
      () => localStore.deleteReview(id),
    ),
};

export const stockApi = {
  add: (data: any) =>
    tryApi(
      () => api.post('/stock/add', data),
      () => localStore.addStock(data),
    ),
  getByProduct: (productId: string | number) =>
    tryApi(
      () => api.get(`/stock/${productId}`),
      () => localStore.getStockByProduct(productId),
    ),
  delete: (id: number) =>
    tryApi(
      () => api.delete(`/stock/${id}`),
      () => localStore.deleteStockItem(id),
    ),
};

export const authApi = {
  login: ({ password }: { password: string }) =>
    tryApi(
      () => api.post('/auth/login', { password }),
      () => {
        const result = localStore.login(password);
        if (!result) throw new Error('Wrong admin password');
        return result;
      },
    ),
  me: () =>
    tryApi(
      () => api.get('/auth/me'),
      () => {
        const admin = localStore.getAdmin();
        const token = localStorage.getItem('admin_token');
        if (!token || !admin.email) throw new Error('Not authenticated');
        return { admin: { role: 'admin', email: admin.email } };
      },
    ),
};

export const paymentsApi = {
  mockConfirm: (orderId: string) =>
    tryApi(
      () => api.post(`/payments/mock-confirm/${orderId}`),
      () => { throw new Error('Payments require a backend connection'); },
    ),
};

export const ltcApi = {
  getActive: () =>
    tryApi(
      () => api.get('/ltc/active'),
      () => localStore.getActiveLtc(),
    ),
  getAll: () =>
    tryApi(
      () => api.get('/ltc'),
      () => localStore.getLtcAddresses(),
    ),
  add: (data: any) =>
    tryApi(
      () => api.post('/ltc', data),
      () => localStore.addLtcAddress(data),
    ),
  activate: (id: number) =>
    tryApi(
      () => api.put(`/ltc/${id}/activate`),
      () => localStore.activateLtcAddress(id),
    ),
  delete: (id: number) =>
    tryApi(
      () => api.delete(`/ltc/${id}`),
      () => localStore.deleteLtcAddress(id),
    ),
};

export const settingsApi = {
  get: () =>
    tryApi(
      () => api.get('/settings'),
      () => localStore.getSettings(),
    ),
  update: (data: { store_name?: string; logo_url?: string; store_tagline?: string }) =>
    tryApi(
      () => api.put('/settings', data),
      () => localStore.updateSettings(data),
    ),
  changePassword: (data: { current_password: string; new_password: string }) =>
    tryApi(
      () => api.put('/settings/password', data),
      () => localStore.changePassword(data.current_password, data.new_password),
    ),
};

export default api;

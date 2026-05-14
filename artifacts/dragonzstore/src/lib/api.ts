import axios from 'axios';

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

export const productsApi = {
  getAll: (params?: any) => api.get('/products', { params }),
  getById: (id: number) => api.get(`/products/${id}`),
  getStats: () => api.get('/products/stats'),
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
  getAll: () => api.get('/categories'),
  create: (data: any) => api.post('/categories', data),
  delete: (id: number) => api.delete(`/categories/${id}`),
};

export const ordersApi = {
  create: (data: any) => api.post('/orders', data),
  getStatus: (orderId: string) => api.get(`/orders/status/${orderId}`),
  getAll: (params?: any) => api.get('/orders', { params }),
  getAnalytics: () => api.get('/orders/analytics'),
  search: (q: string) => api.get('/orders/search', { params: { q } }),
  getDetail: (orderId: string) => api.get(`/orders/detail/${orderId}`),
};

export const reviewsApi = {
  getAll: () => api.get('/reviews'),
  create: (data: any) => api.post('/reviews', data),
  delete: (id: number) => api.delete(`/reviews/${id}`),
};

export const stockApi = {
  add: (data: any) => api.post('/stock/add', data),
  getByProduct: (productId: string | number) =>
    api.get(`/stock/${productId}`),
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
  getActive: () => api.get('/ltc/active'),
  getAll: () => api.get('/ltc'),
  add: (data: any) => api.post('/ltc', data),
  activate: (id: number) => api.put(`/ltc/${id}/activate`),
  delete: (id: number) => api.delete(`/ltc/${id}`),
};

export const settingsApi = {
  get: () => api.get('/settings'),
  update: (data: { store_name?: string; logo_url?: string; store_tagline?: string }) =>
    api.put('/settings', data),
  changePassword: (data: { current_password: string; new_password: string }) =>
    api.put('/settings/password', data),
};

export default api;

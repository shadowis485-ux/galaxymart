import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({ baseURL: BASE_URL, timeout: 15000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r.data,
  (error) => Promise.reject(new Error(error.response?.data?.error || error.message || 'Network error'))
);

export const productsApi = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getStats: () => api.get('/products/stats'),
  create: (data) => api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/products/${id}`),
};

export const categoriesApi = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const ordersApi = {
  create: (data) => api.post('/orders', data),
  getStatus: (orderId) => api.get(`/orders/status/${orderId}`),
  getAll: (params) => api.get('/orders', { params }),
  getAnalytics: () => api.get('/orders/analytics'),
  search: (q) => api.get('/orders/search', { params: { q } }),
  getDetail: (orderId) => api.get(`/orders/detail/${orderId}`),
};

export const reviewsApi = {
  getAll: () => api.get('/reviews'),
  create: (data) => api.post('/reviews', data),
  delete: (id) => api.delete(`/reviews/${id}`),
};

export const stockApi = {
  add: (data) => api.post('/stock/add', data),
  getByProduct: (productId) => api.get(`/stock/${productId}`),
  delete: (id) => api.delete(`/stock/${id}`),
};

export const authApi = {
  login: ({ password }) => api.post('/auth/login', { password }),
  me: () => api.get('/auth/me'),
};

export const paymentsApi = {
  mockConfirm: (orderId) => api.post(`/payments/mock-confirm/${orderId}`),
};

export const ltcApi = {
  getActive: () => api.get('/ltc/active'),
  getAll: () => api.get('/ltc'),
  add: (data) => api.post('/ltc', data),
  activate: (id) => api.put(`/ltc/${id}/activate`),
  delete: (id) => api.delete(`/ltc/${id}`),
};

export default api;

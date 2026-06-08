import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('np_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global error interceptor
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('np_token');
      localStorage.removeItem('np_user');
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

export default api;

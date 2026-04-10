import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5067/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// INTERCEPTOR: Otomatis menyisipkan JWT Token ke setiap request (jika ada)
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token'); // Ambil token dari cookie
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`; // Tempelkan ke header
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Menangani error 401 (Unauthorized) secara global
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url ?? '';
      const isAuthRequest = requestUrl.includes('/Auth/login') || requestUrl.includes('/Auth/register');

      if (!isAuthRequest) {
        Cookies.remove('token', { path: '/' });
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.assign('/login');
        }
      }
    }
    return Promise.reject(error);
  },
);

export default api;

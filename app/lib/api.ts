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
  }
);

// Menangani error 401 (Unauthorized) secara global
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Jika token expired/tidak valid, hapus cookie dan lempar ke login
      Cookies.remove('token');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
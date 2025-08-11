// frontend/src/api/http.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const http = axios.create({ baseURL: API_URL });

// Attach token on every request
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
});

// Handle auth failures globally
http.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    const msg = error?.response?.data?.message;
    if (status === 401) {
      // Clear auth and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isPremium');
      localStorage.removeItem('premiumPlan');
      if (msg) console.warn('Auth error:', msg);
      // Redirect only if not already on login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default http;

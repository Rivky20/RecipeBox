import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:6001',
});

// Attach JWT token from localStorage to every request
api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('recipebox_user');
  if (stored) {
    try {
      const { token } = JSON.parse(stored);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // corrupted storage — ignore
    }
  }
  return config;
});

// Handle 401 — session expired
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('recipebox_user');
      window.dispatchEvent(new CustomEvent('session-expired'));
    }
    return Promise.reject(error);
  }
);

export default api;

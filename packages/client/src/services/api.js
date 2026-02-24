import axios from 'axios';

// 1. Create the Axios instance
// We use import.meta.env.VITE_API_URL so it's easy to change later
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Adjust if your server port is different
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Request Interceptor: Auto-attach Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('swapit_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. Response Interceptor: Handle Token Expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If server says "Unauthorized", clear storage and go to login
      localStorage.removeItem('swapit_token');
      // Optional: window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default api;
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://spott.onrender.com/api',
});

// Add a request interceptor to add the token to auth headers
api.interceptors.request.use((config) => {
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
  } catch (error) {
    console.error('Error in API interceptor:', error);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;

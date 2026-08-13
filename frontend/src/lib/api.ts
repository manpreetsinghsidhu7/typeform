import axios from 'axios';

// Use environment variable or fallback to localhost for development
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://typeform-backend-k4or.onrender.com/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('typeform_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

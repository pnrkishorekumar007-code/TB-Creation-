import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  // Same-origin by default: on Vercel, vercel.json routes /api/* to the
  // backend function. Set NEXT_PUBLIC_API_URL to override (e.g. local dev).
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('tb_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

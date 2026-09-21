import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  // Same-origin by default: on Vercel, vercel.json routes /api/* to the
  // backend function. Set NEXT_PUBLIC_API_URL to override (e.g. local dev).
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  // Send cookies (the httpOnly tb_token session cookie) on cross-origin
  // requests too, so local dev against localhost:5000 keeps working.
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  // Legacy: some browsers may still hold a pre-harden JS-visible tb_token
  // cookie. The server prefers the httpOnly cookie, so this header is only
  // a fallback and adds no new exposure.
  const token = Cookies.get('tb_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

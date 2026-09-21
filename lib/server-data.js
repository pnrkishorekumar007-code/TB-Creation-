import { cookies } from 'next/headers';

const API_BASE_URL = (() => {
  let base = process.env.NEXT_PUBLIC_API_URL || '/api';
  if (base.startsWith('/') || !base.startsWith('http')) {
    const host = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';
    base = `${host}${base.startsWith('/') ? '' : '/'}${base}`;
  }
  return base;
})();

export async function fetchApi(path, options = {}) {
  try {
    const store = cookies();
    const token = store.get('tb_token')?.value;
    const headers = { ...(options.headers || {}) };
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`${API_BASE_URL}${path}`, {
      cache: 'no-store',
      ...options,
      headers,
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
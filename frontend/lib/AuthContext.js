'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import api from './api';

const AuthContext = createContext(null);

const normalizeUser = (u) => ({
  id: u.id || u._id,
  name: u.name || '',
  email: u.email || '',
  role: u.role || 'user',
  bio: u.bio || '',
  avatarUrl: u.avatarUrl || '',
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('tb_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then((res) => setUser(normalizeUser(res.data.user)))
      .catch(() => Cookies.remove('tb_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    Cookies.set('tb_token', res.data.token, { expires: 30 });
    setUser(normalizeUser(res.data.user));
    return res.data.user;
  };

  const signup = async (name, email, password, role) => {
    const res = await api.post('/auth/signup', { name, email, password, role });
    Cookies.set('tb_token', res.data.token, { expires: 30 });
    setUser(normalizeUser(res.data.user));
    return res.data.user;
  };

  const logout = () => {
    Cookies.remove('tb_token');
    setUser(null);
  };

  const updateUser = (updated) => setUser(normalizeUser(updated));

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

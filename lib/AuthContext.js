'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import api from './api';

const AuthContext = createContext(null);

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
      .then((res) => setUser(res.data.user))
      .catch(() => Cookies.remove('tb_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    Cookies.set('tb_token', res.data.token, { expires: 30, sameSite: 'Lax', secure: window.location.protocol === 'https:' });
    setUser(res.data.user);
    return res.data.user;
  };

  const signup = async (name, email, password, role) => {
    const res = await api.post('/auth/signup', { name, email, password, role });
    Cookies.set('tb_token', res.data.token, { expires: 30, sameSite: 'Lax', secure: window.location.protocol === 'https:' });
    setUser(res.data.user);
    return res.data.user;
  };

  // Lets pages (e.g. profile) push updated user info into the navbar instantly.
  const updateUser = (partial) => setUser((u) => ({ ...u, ...partial }));

  const logout = () => {
    Cookies.remove('tb_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

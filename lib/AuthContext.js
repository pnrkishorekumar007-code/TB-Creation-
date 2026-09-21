'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import api from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // The session token lives in an httpOnly cookie the browser sends with every
  // request (including the Authorization-free /auth/me probe). JS never reads
  // the raw token, so it can't be exfiltrated by a script.
  useEffect(() => {
    api
      .get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => {
        // Clean up any pre-hardening JS-visible cookie still lying around.
        Cookies.remove('tb_token');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    setUser(res.data.user);
    return res.data.user;
  };

  const signup = async (name, email, password, role) => {
    const res = await api.post('/auth/signup', { name, email, password, role });
    setUser(res.data.user);
    return res.data.user;
  };

  // Lets pages (e.g. profile) push updated user info into the navbar instantly.
  const updateUser = (partial) => setUser((u) => ({ ...u, ...partial }));

  const logout = async () => {
    try {
      // Clear the httpOnly session cookie server-side.
      await api.post('/auth/logout');
    } catch {
      // Never block logout on the network call.
    }
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

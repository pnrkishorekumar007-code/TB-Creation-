'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    let t = 'dark';
    try {
      t = localStorage.getItem('tb-theme') || 'dark';
    } catch {
      /* storage unavailable */
    }
    setTheme(t);
    document.documentElement.dataset.theme = t;
  }, []);

  const toggle = () => {
    setTheme((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('tb-theme', next);
      } catch {
        /* storage unavailable */
      }
      document.documentElement.dataset.theme = next;
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
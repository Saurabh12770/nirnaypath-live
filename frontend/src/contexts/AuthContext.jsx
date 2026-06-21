/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('np_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(() => {
    return !!localStorage.getItem('np_token');
  });

  useEffect(() => {
    const token = localStorage.getItem('np_token');
    if (token) {
      api.get('/auth/me')
        .then(res => setUser(res.data.user))
        .catch(() => { localStorage.removeItem('np_token'); localStorage.removeItem('np_user'); })
        .finally(() => setLoading(false));
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user: userData } = res.data;
    localStorage.setItem('np_token', token);
    localStorage.setItem('np_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    const { token, user: userData } = res.data;
    localStorage.setItem('np_token', token);
    localStorage.setItem('np_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('np_token');
    localStorage.removeItem('np_user');
    setUser(null);
  }, []);

  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('np_lang') || 'en';
  });

  const setLanguage = useCallback((lang) => {
    localStorage.setItem('np_lang', lang);
    setLanguageState(lang);
  }, []);

  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('np_theme') || 'dark';
  });

  const setTheme = useCallback((t) => {
    localStorage.setItem('np_theme', t);
    setThemeState(t);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, language, setLanguage, theme, setTheme }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

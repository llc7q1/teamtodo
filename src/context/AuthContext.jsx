// src/context/AuthContext.jsx
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api } from '../utils/api';
import { getToken, saveToken, removeToken } from '../utils/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getToken);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!getToken());

  const isLoggedIn = !!token;

  const fetchUser = useCallback(async () => {
    try {
      const userData = await api.get('/me');
      setUser(userData);
    } catch {
      removeToken();
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user on mount if token exists
  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (username, password) => {
    const data = await api.post('/login', { username, password });
    saveToken(data.access_token);
    setToken(data.access_token);
    const userData = await api.get('/me');
    setUser(userData);
  }, []);

  const register = useCallback(async (username, password, displayName) => {
    await api.post('/register', {
      username,
      password,
      display_name: displayName,
    });
  }, []);

  const logout = useCallback(() => {
    removeToken();
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

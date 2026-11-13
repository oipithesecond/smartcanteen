// frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
const API_BASE = 'http://localhost:5005/api';
const TOKEN_KEY = 'sc_auth_token';

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(() => {
    try { return localStorage.getItem(TOKEN_KEY) || null; } catch { return null; }
  });
  const [isLoading, setIsLoading] = useState(true); // hydrating from token
  const [authError, setAuthError] = useState(null);

  // Set axios default auth header whenever token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // On mount: if token exists, verify it and restore user session
  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    axios.get(`${API_BASE}/auth/me`)
      .then(res => {
        setCurrentUser(res.data.user);
      })
      .catch(() => {
        // Token invalid or expired — clear it
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setCurrentUser(null);
        delete axios.defaults.headers.common['Authorization'];
      })
      .finally(() => setIsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  const login = useCallback(async (email, password) => {
    setAuthError(null);
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
      const { token: newToken, user } = res.data;
      localStorage.setItem(TOKEN_KEY, newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setToken(newToken);
      setCurrentUser(user);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Please try again.';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  }, []);

  const signup = useCallback(async (formData) => {
    setAuthError(null);
    try {
      const res = await axios.post(`${API_BASE}/auth/signup`, formData);
      const { token: newToken, user } = res.data;
      localStorage.setItem(TOKEN_KEY, newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setToken(newToken);
      setCurrentUser(user);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed. Please try again.';
      setAuthError(msg);
      return { success: false, error: msg };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setCurrentUser(null);
  }, []);

  const isAuthenticated = Boolean(currentUser && token);
  const isAdmin = currentUser?.role === 'ADMIN';
  const isManager = currentUser?.role === 'OUTLET_MANAGER';

  const value = {
    currentUser,
    token,
    isLoading,
    isAuthenticated,
    isAdmin,
    isManager,
    authError,
    setAuthError,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

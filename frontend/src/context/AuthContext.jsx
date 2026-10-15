import React, { createContext, useContext, useState, useCallback } from 'react';

// Módulo centralizado para gestión de sesión
// Regla: Toda validación de sesión pasa por este módulo y nunca se loguean credenciales ni tokens.
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem('centavo_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => {
    try {
      return sessionStorage.getItem('centavo_token');
    } catch {
      return null;
    }
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return Boolean(sessionStorage.getItem('centavo_token'));
    } catch {
      return false;
    }
  });

  const saveSession = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    setIsAuthenticated(true);
    try {
      sessionStorage.setItem('centavo_user', JSON.stringify(userData));
      sessionStorage.setItem('centavo_token', jwtToken);
    } catch {
      // ignorar errores de almacenamiento
    }
  };

  const login = useCallback(async ({ email, password }) => {
    if (!email || !password) {
      throw new Error('Por favor completa todos los campos.');
    }

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || 'Credenciales inválidas.');
    }

    saveSession(data.user, data.token);
    return data.user;
  }, []);

  const register = useCallback(async ({ email, password, name }) => {
    if (!email || !password) {
      throw new Error('Por favor completa todos los campos.');
    }

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || 'Error al registrar usuario.');
    }

    saveSession(data.user, data.token);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    try {
      sessionStorage.removeItem('centavo_user');
      sessionStorage.removeItem('centavo_token');
    } catch {
      // ignorar errores de almacenamiento
    }
  }, []);

  const value = {
    user,
    token,
    isAuthenticated,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};

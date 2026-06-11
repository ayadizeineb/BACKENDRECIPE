import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('recipe_app_token'));
  const [loading, setLoading] = useState(true);

  // Set default auth header on app mount / token change
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Retrieve user profile to ensure sync
      const savedUser = localStorage.getItem('recipe_app_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (_) {
          localStorage.removeItem('recipe_app_user');
        }
      }
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/users/signin', { email, password });
      const { token: receivedToken, user: userData } = response.data;
      
      localStorage.setItem('recipe_app_token', receivedToken);
      localStorage.setItem('recipe_app_user', JSON.stringify(userData));
      setToken(receivedToken);
      setUser(userData);
      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Login failed. Please try again.' 
      };
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await axios.post('/api/users', { username, email, password });
      const { token: receivedToken, user: userData } = response.data;

      localStorage.setItem('recipe_app_token', receivedToken);
      localStorage.setItem('recipe_app_user', JSON.stringify(userData));
      setToken(receivedToken);
      setUser(userData);
      return { success: true };
    } catch (err) {
      console.error('Registration error:', err);
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed.'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('recipe_app_token');
    localStorage.removeItem('recipe_app_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Check if user is already logged in on App Start
  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('swapit_token');
      if (token) {
        try {
          // This calls the NEW endpoint we just added to backend
          const { data } = await api.get('/auth/me');
          setUser(data);
        } catch (error) {
          console.error("Session expired");
          localStorage.removeItem('swapit_token');
        }
      }
      setLoading(false);
    };
    checkLoggedIn();
  }, []);

  // 2. Login Function
  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('swapit_token', data.token);
      
      // Fetch user details immediately after login
      const userRes = await api.get('/auth/me');
      setUser(userRes.data);
      
      toast.success(`Welcome back, ${userRes.data.username}!`);
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    }
  };

  // 3. Register Function
  const register = async (username, email, password) => {
    try {
      await api.post('/auth/register', { username, email, password });
      // Auto-login after register
      await login(email, password);
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
      return false;
    }
  };

  // 4. Logout Function
  const logout = () => {
    localStorage.removeItem('swapit_token');
    setUser(null);
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom Hook for easy usage
export const useAuth = () => useContext(AuthContext);
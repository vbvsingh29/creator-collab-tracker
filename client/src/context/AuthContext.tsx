import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { apiLogin, apiRegister, apiGetMe, getAuthToken, setAuthToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; handle: string; platform: string }) => Promise<void>;
  demoLogin?: (email: string) => Promise<void>;
  setSession: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize session: Clean production authentication with automatic guest state
  useEffect(() => {
    async function initAuth() {
      // One-time automatic cleanup of legacy test cache for production visitors
      const PROD_KEY = 'collabflow_prod_v1';
      if (!localStorage.getItem(PROD_KEY)) {
        localStorage.clear();
        sessionStorage.clear();
        localStorage.setItem(PROD_KEY, 'true');
        setUser(null);
        setToken(null);
        setLoading(false);
        return;
      }

      const savedToken = getAuthToken();

      if (!savedToken) {
        setUser(null);
        setToken(null);
        setLoading(false);
        return;
      }

      try {
        const currentUser = await apiGetMe();
        if (currentUser && currentUser.id) {
          setUser(currentUser);
          setToken(savedToken);
        } else {
          setAuthToken(null);
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        setAuthToken(null);
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    const data = await apiLogin(email, pass);
    setAuthToken(data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (userData: { name: string; email: string; password: string; handle: string; platform: string }) => {
    const data = await apiRegister(userData);
    setAuthToken(data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const setSession = (newToken: string, newUser: User) => {
    setAuthToken(newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const demoLogin = async (email: string) => {
    await login(email, 'password123');
  };

  const logout = () => {
    setAuthToken(null);
    setToken(null);
    setUser(null);
    localStorage.removeItem('collabflow_token');
    localStorage.removeItem('collabflow_mock_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, demoLogin, logout, setSession }}>
      {children}
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

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { apiLogin, apiRegister, apiGetMe, getAuthToken, setAuthToken } from '../services/api';
import { getLocalUser } from '../services/mockStorage';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; handle: string; platform: string }) => Promise<void>;
  demoLogin: (email: string) => Promise<void>;
  setSession: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOGGED_OUT_KEY = 'collabflow_explicit_logout';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize session from stored token or auto-initialize demo Aarav on initial visit
  useEffect(() => {
    async function initAuth() {
      const explicitLogout = localStorage.getItem(LOGGED_OUT_KEY) === 'true';
      const savedToken = getAuthToken();

      if (!savedToken) {
        if (!explicitLogout) {
          // First-time visit: automatically activate demo creator Aarav Sharma for full interactive review
          const demoUser = getLocalUser();
          const demoToken = 'collabflow-demo-token-aarav';
          setAuthToken(demoToken);
          setToken(demoToken);
          setUser(demoUser);
        }
        setLoading(false);
        return;
      }

      try {
        const currentUser = await apiGetMe();
        setUser(currentUser);
        setToken(savedToken);
      } catch (err) {
        console.warn('Session verification fallback, activating local creator session');
        const fallbackUser = getLocalUser();
        setUser(fallbackUser);
        setToken(savedToken);
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    localStorage.removeItem(LOGGED_OUT_KEY);
    const data = await apiLogin(email, pass);
    setAuthToken(data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (userData: { name: string; email: string; password: string; handle: string; platform: string }) => {
    localStorage.removeItem(LOGGED_OUT_KEY);
    const data = await apiRegister(userData);
    setAuthToken(data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const setSession = (newToken: string, newUser: User) => {
    localStorage.removeItem(LOGGED_OUT_KEY);
    setAuthToken(newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const demoLogin = async (email: string) => {
    localStorage.removeItem(LOGGED_OUT_KEY);
    await login(email, 'password123');
  };

  const logout = () => {
    localStorage.setItem(LOGGED_OUT_KEY, 'true');
    setAuthToken(null);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, demoLogin, logout, setSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

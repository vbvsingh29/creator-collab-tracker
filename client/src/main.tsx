import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { AccountProvider } from './context/AccountContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppLockProvider } from './context/AppLockContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <AccountProvider>
          <AppLockProvider>
            <App />
          </AppLockProvider>
        </AccountProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
);

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CreatorAccount } from '../types';
import { fetchCreatorAccounts, createCreatorAccount, deleteCreatorAccount } from '../services/api';
import { useAuth } from './AuthContext';

interface AccountContextType {
  accounts: CreatorAccount[];
  selectedAccountId: string;
  selectedAccount: CreatorAccount | null;
  loading: boolean;
  setSelectedAccountId: (id: string) => void;
  refreshAccounts: () => Promise<void>;
  addAccount: (data: { platform: 'instagram' | 'youtube'; handle: string; name?: string }) => Promise<CreatorAccount | null>;
  removeAccount: (id: string) => Promise<boolean>;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const AccountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<CreatorAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(false);

  const refreshAccounts = useCallback(async () => {
    if (!user) {
      setAccounts([]);
      setSelectedAccountId('all');
      return;
    }

    try {
      setLoading(true);
      const res = await fetchCreatorAccounts();
      const accList = (res as any)?.accounts || [];
      setAccounts(accList);
      
      // If current selected account was deleted, fallback to 'all'
      if (selectedAccountId !== 'all' && !accList.some((a: CreatorAccount) => a.id === selectedAccountId)) {
        setSelectedAccountId('all');
      }
    } catch (err) {
      console.warn('⚠️ [AccountContext] Failed to load accounts:', err);
    } finally {
      setLoading(false);
    }
  }, [user, selectedAccountId]);

  useEffect(() => {
    refreshAccounts();
  }, [user]);

  const addAccount = async (data: { platform: 'instagram' | 'youtube'; handle: string; name?: string }): Promise<CreatorAccount | null> => {
    try {
      const res = await createCreatorAccount(data);
      const newAcc = (res as any)?.account;
      if (newAcc) {
        setAccounts(prev => [...prev, newAcc]);
        return newAcc;
      }
      return null;
    } catch (err) {
      console.error('❌ [AccountContext] Add account error:', err);
      throw err;
    }
  };

  const removeAccount = async (id: string): Promise<boolean> => {
    try {
      await deleteCreatorAccount(id);
      setAccounts(prev => prev.filter(a => a.id !== id));
      if (selectedAccountId === id) {
        setSelectedAccountId('all');
      }
      return true;
    } catch (err) {
      console.error('❌ [AccountContext] Delete account error:', err);
      throw err;
    }
  };

  const selectedAccount = selectedAccountId === 'all' 
    ? null 
    : (accounts.find(a => a.id === selectedAccountId) || null);

  return (
    <AccountContext.Provider
      value={{
        accounts,
        selectedAccountId,
        selectedAccount,
        loading,
        setSelectedAccountId,
        refreshAccounts,
        addAccount,
        removeAccount,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

export const useAccounts = (): AccountContextType => {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error('useAccounts must be used within an AccountProvider');
  }
  return context;
};

"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Account } from '../types';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from './AuthContext';

interface AccountContextType {
  accounts: Account[];
  addAccount: (account: Omit<Account, 'id'>) => Promise<Account | null>;
  selectedAccounts: Account[];
  setSelectedAccountIds: (accountIds: string[]) => void;
  isLoading: boolean;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const AccountProvider = ({ children }: { children: ReactNode }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchAccounts = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('id, name, color, opening_balance')
        .eq('user_id', user.id);

      if (error) throw error;

      const formattedAccounts: Account[] = data.map(account => ({
        id: account.id,
        name: account.name,
        color: account.color,
        opening_balance: account.opening_balance || 0,
      }));

      setAccounts(formattedAccounts);

      if (formattedAccounts.length > 0 && selectedAccountIds.length === 0) {
        setSelectedAccountIds([formattedAccounts[0].id]);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, selectedAccountIds.length]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const addAccount = async (account: Omit<Account, 'id'>): Promise<Account | null> => {
    if (!user) return null;

    try {
      const { data: existingAccounts, error: existingError } = await supabase
        .from('accounts')
        .select('id, name, color, opening_balance')
        .eq('user_id', user.id)
        .eq('name', account.name.trim())
        .single();

      if (existingError && existingError.code !== 'PGRST116') {
        console.error('Error checking for existing account:', existingError);
        
        if (existingError.message?.includes('Failed to fetch') || existingError.code === '') {
          console.warn('Network error during duplicate check, proceeding with account creation');
        } else {
          return null;
        }
      } else if (existingAccounts) {
        return {
          id: existingAccounts.id,
          name: existingAccounts.name,
          color: existingAccounts.color,
          opening_balance: existingAccounts.opening_balance || 0,
        };
      }
    } catch (networkError) {
      console.warn('Network error during account lookup, proceeding with creation:', networkError);
    }

    const { data, error } = await supabase
      .from('accounts')
      .insert([{ 
        name: account.name,
        color: account.color,
        opening_balance: account.opening_balance || 0,
        user_id: user.id 
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding account:', error);
      return null;
    }

    if (data) {
      const newAccount: Account = {
        id: data.id,
        name: data.name,
        color: data.color,
        opening_balance: data.opening_balance || 0,
      };
      setAccounts(prev => [...prev, newAccount]);
      setSelectedAccountIds(prevIds => [...prevIds, newAccount.id]);
      return newAccount;
    }

    return null;
  };

  const selectedAccounts = accounts.filter(acc => selectedAccountIds.includes(acc.id));

  return (
    <AccountContext.Provider value={{ accounts, addAccount, selectedAccounts, setSelectedAccountIds, isLoading }}>
      {children}
    </AccountContext.Provider>
  );
};

export const useAccounts = () => {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error('useAccounts must be used within an AccountProvider');
  }
  return context;
};

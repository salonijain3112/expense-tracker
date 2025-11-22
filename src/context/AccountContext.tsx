"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Account } from '../types';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from './AuthContext';

interface AccountContextType {
  accounts: Account[];
  addAccount: (account: Omit<Account, 'id'>) => Promise<Account>;
  updateAccount: (
    accountId: string,
    updates: Pick<Account, 'name' | 'color' | 'opening_balance'>
  ) => Promise<Account>;
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

  const addAccount = async (account: Omit<Account, 'id'>): Promise<Account> => {
    if (!user) {
      throw new Error('You need to be signed in to create an account.');
    }

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
          throw existingError;
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
        opening_balance: account.opening_balance ?? 0,
        user_id: user.id 
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding account:', error);
      throw error;
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

    throw new Error('Unable to create account. Please try again.');
  };

  const updateAccount = async (
    accountId: string,
    updates: Pick<Account, 'name' | 'color' | 'opening_balance'>
  ): Promise<Account> => {
    if (!user) {
      throw new Error('You need to be signed in to update an account.');
    }

    const existingAccount = accounts.find(acc => acc.id === accountId);
    if (!existingAccount) {
      throw new Error('Account not found.');
    }

    const optimisticAccount: Account = {
      ...existingAccount,
      ...updates,
    };

    setAccounts(prev => prev.map(acc => (acc.id === accountId ? optimisticAccount : acc)));

    const { data, error } = await supabase
      .from('accounts')
      .update({
        name: updates.name,
        color: updates.color,
        opening_balance: updates.opening_balance ?? 0,
      })
      .eq('id', accountId)
      .eq('user_id', user.id)
      .select('id, name, color, opening_balance')
      .single();

    if (error) {
      console.error('Error updating account:', error);
      setAccounts(prev => prev.map(acc => (acc.id === accountId ? existingAccount : acc)));
      throw error;
    }

    if (!data) {
      setAccounts(prev => prev.map(acc => (acc.id === accountId ? existingAccount : acc)));
      throw new Error('No updated account returned.');
    }

    const updatedAccount: Account = {
      id: data.id,
      name: data.name,
      color: data.color,
      opening_balance: data.opening_balance || 0,
    };

    setAccounts(prev => prev.map(acc => (acc.id === accountId ? updatedAccount : acc)));
    return updatedAccount;
  };

  const selectedAccounts = accounts.filter(acc => selectedAccountIds.includes(acc.id));

  return (
    <AccountContext.Provider value={{ accounts, addAccount, updateAccount, selectedAccounts, setSelectedAccountIds, isLoading }}>
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

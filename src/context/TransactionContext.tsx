'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Transaction } from '../types';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from './AuthContext';

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  bulkAddTransactions: (transactions: Omit<Transaction, 'id'>[]) => Promise<void>;
  isLoading: boolean;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchTransactions = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('id, account_id, description, amount, type, date, to_account_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const formattedTransactions: Transaction[] = data.map(t => ({
        id: t.id,
        accountId: t.account_id,
        description: t.description,
        amount: t.amount,
        type: t.type,
        date: t.date || undefined,
        toAccountId: t.to_account_id,
      }));

      setTransactions(formattedTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!user) return;

    if (transaction.type === 'transfer' && transaction.toAccountId) {
      const expense = {
        ...transaction,
        type: 'expense' as const,
        user_id: user.id,
        account_id: transaction.accountId,
        to_account_id: transaction.toAccountId,
      };
      const income = {
        ...transaction,
        type: 'income' as const,
        user_id: user.id,
        account_id: transaction.toAccountId,
        to_account_id: transaction.accountId,
      };

      const { data, error } = await supabase.from('transactions').insert([expense, income]).select();

      if (error) {
        console.error('Error adding transfer transaction:', error);
        return;
      }
      if (data) {
        await fetchTransactions(); // Refetch all transactions to get the latest state
      }

    } else {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{ ...transaction, user_id: user.id, account_id: transaction.accountId }])
        .select()
        .single();

      if (error) {
        console.error('Error adding transaction:', error);
        return;
      }
      if (data) {
        await fetchTransactions(); // Refetch all transactions to get the latest state
      }
    }
  };

  const bulkAddTransactions = async (newTransactions: Omit<Transaction, 'id'>[]) => {
    if (!user) return;

    const transactionsToInsert = newTransactions.map(t => ({
      user_id: user.id,
      account_id: t.accountId,
      description: t.description,
      amount: t.amount,
      type: t.type,
      date: t.date,
      to_account_id: t.toAccountId,
    }));

    try {
      const { error } = await supabase.from('transactions').insert(transactionsToInsert);

      if (error) {
        console.error('Error bulk adding transactions:', error);
        throw error;
      } else {
        await fetchTransactions(); // Refetch to update the UI
      }
    } catch (networkError) {
      console.error('Network error during bulk transaction insert:', networkError);
      throw networkError;
    }
  };

  return (
    <TransactionContext.Provider value={{ transactions, addTransaction, bulkAddTransactions, isLoading }}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};

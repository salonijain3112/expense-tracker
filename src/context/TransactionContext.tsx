'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Transaction } from '../types';

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    if (transaction.type === 'transfer' && transaction.toAccountId) {
      const transferId = new Date().toISOString();
      const expenseTransaction: Transaction = {
        ...transaction,
        id: transferId,
        type: 'expense',
        description: `Transfer to account`,
      };
      const incomeTransaction: Transaction = {
        ...transaction,
        id: `${transferId}-to`,
        accountId: transaction.toAccountId,
        type: 'income',
        description: `Transfer from account`,
      };
      setTransactions(prev => [...prev, expenseTransaction, incomeTransaction]);
    } else {
      const newTransaction = { ...transaction, id: new Date().toISOString() };
      setTransactions(prevTransactions => [...prevTransactions, newTransaction]);
    }
  };

  return (
    <TransactionContext.Provider value={{ transactions, addTransaction, setTransactions }}>
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

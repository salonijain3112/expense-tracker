"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Account } from '../types';

interface AccountContextType {
  accounts: Account[];
  addAccount: (account: Omit<Account, 'id'>) => void;
  selectedAccounts: Account[];
  setSelectedAccountIds: (accountIds: string[]) => void;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const AccountProvider = ({ children }: { children: ReactNode }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);

  const addAccount = (account: Omit<Account, 'id'>) => {
    const newAccount = { ...account, id: new Date().toISOString() };
    setAccounts(prevAccounts => [...prevAccounts, newAccount]);
    // Automatically select the new account
    setSelectedAccountIds(prevIds => [...prevIds, newAccount.id]);
  };

  const selectedAccounts = accounts.filter(acc => selectedAccountIds.includes(acc.id));

  return (
    <AccountContext.Provider value={{ accounts, addAccount, selectedAccounts, setSelectedAccountIds }}>
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

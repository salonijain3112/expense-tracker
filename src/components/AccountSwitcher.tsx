'use client';

import React, { useState } from 'react';
import { useAccounts } from '@/context/AccountContext';
import { AddAccountForm } from './AddAccountForm';

export const AccountSwitcher = () => {
  const { accounts, selectedAccounts, setSelectedAccountIds } = useAccounts();
  const [isAddingAccount, setIsAddingAccount] = useState(false);

  const handleAccountClick = (accountId: string) => {
    setSelectedAccountIds([accountId]);
  };

  const handleSelectAll = () => {
    setSelectedAccountIds(accounts.map(a => a.id));
  };

  const areAllSelected = accounts.length > 0 && selectedAccounts.length === accounts.length;

  return (
    <div>
      <div className="flex items-center flex-wrap gap-2 p-4 bg-gray-100 dark:bg-dark-secondary rounded-lg">
        {accounts.map(account => {
          const isSelected = selectedAccounts.some(a => a.id === account.id);
          return (
            <button
              key={account.id}
              onClick={() => handleAccountClick(account.id)}
              className={`cursor-pointer px-4 py-2 rounded-md text-sm font-medium border-2 transition-colors duration-200 ease-in-out \
                focus:ring-2 focus:ring-offset-2 focus:ring-primary-focus \
                ${isSelected ? 'text-white' : 'text-gray-700 dark:text-dark-text hover:bg-gray-200 dark:hover:bg-dark-hover'}`}
              style={{
                backgroundColor: isSelected ? account.color : 'transparent',
                borderColor: account.color,
              }}
            >
              {account.name}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-2 px-4">
        <button
          onClick={handleSelectAll}
          disabled={areAllSelected}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500 disabled:text-gray-400 disabled:cursor-not-allowed underline transition-colors"
        >
          Select All
        </button>

        <button
          onClick={() => setIsAddingAccount(true)}
          className="px-4 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
        >
          + Add Account
        </button>
      </div>

      {isAddingAccount && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-dark-secondary p-6 rounded-lg shadow-xl w-full max-w-md">
            <AddAccountForm onClose={() => setIsAddingAccount(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

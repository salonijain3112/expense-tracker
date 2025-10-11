import React from 'react';
import AddTransactionForm from './AddTransactionForm';
import DataImportExport from './DataImportExport';
import { Transaction } from '@/types';
import { useAccounts } from '@/context/AccountContext';

interface ActionsProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  transactions: Transaction[];
  onImport: (transactions: Transaction[]) => Promise<void>;
}

const Actions: React.FC<ActionsProps> = ({ onAddTransaction, transactions, onImport }) => {
  const { accounts } = useAccounts();

  return (
    <div className="space-y-6">
      {/* Add Transaction Form */}
      {accounts.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-dark-text">Add Transaction</h2>
          <AddTransactionForm onAddTransaction={onAddTransaction} />
        </div>
      )}

      {/* Import/Export */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-dark-text">Import/Export</h2>
        <DataImportExport transactions={transactions} onImport={onImport} />
      </div>

      {/* Account Creation Hint */}
      {accounts.length === 0 && (
        <div className="card">
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-brand-accent/10 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text mb-2">
              Create Your First Account
            </h3>
            <p className="text-gray-500 dark:text-dark-subtle mb-4">
              Start by creating an account to track your transactions. You can add multiple accounts for different purposes.
            </p>
            <p className="text-sm text-gray-400 dark:text-dark-subtle">
              Use the account switcher at the top to create and manage your accounts.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Actions;

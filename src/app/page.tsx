"use client";

import { useMemo } from 'react';
import Header from '@/components/Header';
import Summary from '@/components/Summary';
import TransactionList from '@/components/TransactionList';
import AddTransactionForm from '@/components/AddTransactionForm';
import DataImportExport from '@/components/DataImportExport';
import { AccountSwitcher } from '@/components/AccountSwitcher';
import { Transaction } from '@/types';
import { useAccounts } from '@/context/AccountContext';
import { useTransactions } from '@/context/TransactionContext';

export default function Home() {
  const { accounts, selectedAccounts } = useAccounts();
  const { transactions, addTransaction, setTransactions } = useTransactions();

  const handleAddTransaction = (transaction: Omit<Transaction, 'id'>) => {
    addTransaction(transaction);
  };

  const handleImportTransactions = (importedTransactions: Transaction[]) => {
    if (accounts.length === 0) {
      alert('Please add an account before importing transactions.');
      return;
    }
    // If multiple accounts are selected (e.g., 'Select All'), default to the first account.
    const targetAccountId = selectedAccounts.length === 1 ? selectedAccounts[0].id : accounts[0].id;
    const transactionsWithAccountId = importedTransactions.map(t => ({ ...t, accountId: targetAccountId }));
    setTransactions(prev => [...prev, ...transactionsWithAccountId]);
    alert('Transactions imported successfully!');
  };

  const filteredTransactions = useMemo(() => {
    if (selectedAccounts.length === 0) {
      return [];
    }
    const selectedAccountIds = selectedAccounts.map(acc => acc.id);
    return transactions.filter(t => selectedAccountIds.includes(t.accountId));
  }, [transactions, selectedAccounts]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-background text-gray-900 dark:text-dark-text">
      <Header />

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="space-y-8">
          <AccountSwitcher />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Summary transactions={filteredTransactions} />
              <TransactionList transactions={filteredTransactions} />
            </div>

            <div className="space-y-8">
              <div className="card">
                <AddTransactionForm onAddTransaction={handleAddTransaction} />
              </div>
              <div className="card">
                <DataImportExport transactions={filteredTransactions} onImport={handleImportTransactions} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

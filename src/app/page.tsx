"use client";

import { useMemo, useState } from 'react';
import Header from '@/components/Header';
import Summary from '@/components/Summary';
import TransactionList from '@/components/TransactionList';
import AddTransactionForm from '@/components/AddTransactionForm';
import DataImportExport from '@/components/DataImportExport';
import { AccountSwitcher } from '@/components/AccountSwitcher';
import AuthWrapper from '@/components/Auth';
import TabNavigation, { TabKey } from '@/components/TabNavigation';
import Reports from '@/components/Reports';
import Actions from '@/components/Actions';
import ModernDashboard from '@/components/ModernDashboard';
import { Transaction } from '@/types';
import { useAccounts } from '@/context/AccountContext';
import { useTransactions } from '@/context/TransactionContext';

export default function Home() {
  const { accounts, selectedAccounts, setSelectedAccountIds } = useAccounts();
  const { transactions, addTransaction, bulkAddTransactions } = useTransactions();
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');

  const handleAddTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    await addTransaction(transaction);
  };

  const handleImportTransactions = async (importedTransactions: Transaction[]) => {
    try {
      const invalidTransactions = importedTransactions.filter(t => !t.accountId || t.accountId.trim() === '');
      if (invalidTransactions.length > 0) {
        console.error('Some transactions have invalid account IDs:', invalidTransactions);
        alert('Some transactions could not be imported due to invalid account information.');
        return;
      }
      
      const transactionsForBulkInsert = importedTransactions.map(({ id, ...transaction }) => transaction);
      await bulkAddTransactions(transactionsForBulkInsert);
      alert('Transactions imported successfully!');
    } catch (error: unknown) {
      console.error('Import failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      const errorCode = error && typeof error === 'object' && 'code' in error ? (error as { code: string }).code : undefined;
      
      if (errorMessage?.includes('Failed to fetch') || errorCode === '') {
        alert('Import failed due to network connectivity issues. Please check your internet connection and try again.');
      } else {
        alert(`Import failed: ${errorMessage}`);
      }
    }
  };

  const filteredTransactions = useMemo(() => {
    if (selectedAccounts.length === 0) {
      return [];
    }
    const selectedAccountIds = selectedAccounts.map(acc => acc.id);
    return transactions.filter(t => selectedAccountIds.includes(t.accountId));
  }, [transactions, selectedAccounts]);

  const handleAccountSelect = (accountId: string) => {
    // Toggle account selection
    const account = accounts.find(acc => acc.id === accountId);
    if (!account) return;
    
    const isSelected = selectedAccounts.some(acc => acc.id === accountId);
    const currentSelectedIds = selectedAccounts.map(acc => acc.id);
    
    if (isSelected) {
      // Deselect the account
      const newSelectedIds = currentSelectedIds.filter(id => id !== accountId);
      setSelectedAccountIds(newSelectedIds);
    } else {
      // Select the account
      const newSelectedIds = [...currentSelectedIds, accountId];
      setSelectedAccountIds(newSelectedIds);
    }
  };

  const handleFloatingActionClick = () => {
    setActiveTab('actions');
  };

  const renderMobileContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <ModernDashboard 
            transactions={transactions}
            onAccountSelect={handleAccountSelect}
            selectedAccountIds={selectedAccounts.map(acc => acc.id)}
            onAddTransaction={handleFloatingActionClick}
          />
        );
      case 'reports':
        return <Reports transactions={filteredTransactions} />;
      case 'actions':
        return (
          <Actions
            onAddTransaction={handleAddTransaction}
            transactions={filteredTransactions}
            onImport={handleImportTransactions}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AuthWrapper>
      <div className="min-h-screen bg-gray-100 dark:bg-dark-background text-gray-900 dark:text-dark-text">
        <Header />

        <main className="px-4 py-6">
          <div className="space-y-8">

            {/* Desktop Layout - Hidden on mobile and tablet */}
            <div className="hidden md:block">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <Summary transactions={filteredTransactions} />
                  <TransactionList transactions={filteredTransactions} />
                </div>

                <div className="space-y-8">
                  {accounts.length > 0 && (
                  <div className="card">
                    <AddTransactionForm onAddTransaction={handleAddTransaction} />
                  </div>
                  )}
                  <div className="card">
                    <DataImportExport transactions={filteredTransactions} onImport={handleImportTransactions} />
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile/Tablet Layout - Hidden on desktop */}
            <div className="md:hidden pb-20">
              {renderMobileContent()}
            </div>
            
            {/* Show AccountSwitcher only on desktop for now */}
            <div className="hidden md:block">
              <AccountSwitcher />
            </div>
          </div>
        </main>

        {/* Mobile Tab Navigation */}
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </AuthWrapper>
  );
}

"use client";

import { useMemo, useState } from 'react';
import Header from '@/components/Header';
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
  const [reportFocusAccountId, setReportFocusAccountId] = useState<string | undefined>(undefined);

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
    const account = accounts.find(acc => acc.id === accountId);
    if (!account) return;

    setSelectedAccountIds([accountId]);
    setReportFocusAccountId(accountId);
    setActiveTab('reports');
  };

  const handleFloatingActionClick = () => {
    setActiveTab('actions');
  };

  const handleTabChange = (tab: TabKey) => {
    if (tab !== 'reports') {
      setReportFocusAccountId(undefined);
    } else {
      // If user manually navigates to reports, default to all accounts
      setReportFocusAccountId(undefined);
      setSelectedAccountIds(accounts.map(acc => acc.id));
    }
    setActiveTab(tab);
  };

  const renderActiveTabContent = () => {
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
        return (
          <Reports 
            transactions={filteredTransactions}
            initialAccountId={reportFocusAccountId}
          />
        );
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
          <div className="space-y-8 w-full pb-24">
            {renderActiveTabContent()}
          </div>
        </main>

        {/* Mobile Tab Navigation */}
        <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    </AuthWrapper>
  );
}

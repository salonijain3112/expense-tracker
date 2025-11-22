import React, { useMemo, useState } from 'react';
import { Transaction } from '@/types';
import { useAccounts } from '@/context/AccountContext';
import { useCurrency } from '@/context/CurrencyContext';
import AccountCard from './AccountCard';
import { AddAccountForm } from './AddAccountForm';
import { ManageAccountsModal } from './ManageAccountsModal';

interface ModernDashboardProps {
  transactions: Transaction[];
  onAccountSelect?: (accountId: string) => void;
  selectedAccountIds?: string[];
  onAddTransaction?: () => void;
}

const ModernDashboard: React.FC<ModernDashboardProps> = ({ 
  transactions, 
  onAccountSelect,
  selectedAccountIds = [],
  onAddTransaction
}) => {
  const { accounts } = useAccounts();
  const { currency } = useCurrency();
  const currencySymbol = currency === 'INR' ? '₹' : '$';
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [isManagingAccounts, setIsManagingAccounts] = useState(false);

  // Calculate account balances
  const accountBalances = useMemo(() => {
    const balances = new Map<string, number>();
    
    // Initialize with opening balances
    accounts.forEach(account => {
      balances.set(account.id, account.opening_balance || 0);
    });
    
    // Add transaction amounts
    transactions.forEach(transaction => {
      const currentBalance = balances.get(transaction.accountId) || 0;
      if (transaction.type === 'income') {
        balances.set(transaction.accountId, currentBalance + transaction.amount);
      } else {
        balances.set(transaction.accountId, currentBalance - transaction.amount);
      }
    });
    
    return balances;
  }, [accounts, transactions]);

  // Calculate total expenses for the last 30 days
  const expenseData = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentExpenses = transactions.filter(t => 
      t.type === 'expense' && 
      t.date && 
      new Date(t.date) >= thirtyDaysAgo
    );
    
    const totalExpenses = recentExpenses.reduce((sum, t) => sum + t.amount, 0);
    
    // Group expenses by category (using description as category for now)
    const categoryExpenses = new Map<string, number>();
    recentExpenses.forEach(t => {
      const category = t.description.split(' ')[0] || 'Other';
      categoryExpenses.set(category, (categoryExpenses.get(category) || 0) + t.amount);
    });
    
    return {
      total: totalExpenses,
      categories: Array.from(categoryExpenses.entries()).map(([name, amount]) => ({
        name,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
      }))
    };
  }, [transactions]);

  const colors = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6'];

  return (
    <div className="space-y-6 pb-6 w-full px-4">
      {/* List of accounts */}
      <div className="bg-white rounded-2xl p-4 shadow-sm w-full">
        <div className="flex items-center justify-between mb-4 gap-3">
          <h2 className="text-lg font-semibold text-gray-900">List of accounts</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsManagingAccounts(true)}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Manage
            </button>
            <button
              type="button"
              onClick={() => setIsAddingAccount(true)}
              className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              + Add
            </button>
          </div>
        </div>
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {accounts.map(account => (
            <AccountCard
              key={account.id}
              account={account}
              balance={accountBalances.get(account.id) || 0}
              onClick={() => onAccountSelect?.(account.id)}
              isSelected={selectedAccountIds.includes(account.id)}
            />
          ))}
        </div>
      </div>

      {/* Expense structure */}
      <div className="bg-white rounded-2xl p-4 shadow-sm w-full">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Expense structure</h2>
        <p className="text-sm text-gray-500 mb-2">LAST 30 DAYS</p>
        <p className="text-2xl font-bold text-gray-900 mb-6">
          {currencySymbol} {expenseData.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        
        {expenseData.total > 0 ? (
          <div className="flex items-center justify-center">
            <div className="relative w-48 h-48">
              {/* Donut Chart */}
              <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 42 42">
                {/* Background circle */}
                <circle
                  cx="21"
                  cy="21"
                  r="15.915"
                  fill="transparent"
                  stroke="#e5e7eb"
                  strokeWidth="3"
                />
                
                {/* Data circles */}
                {expenseData.categories.map((category, index) => {
                  const color = colors[index % colors.length];
                  const circumference = 2 * Math.PI * 15.915;
                  const strokeDasharray = circumference;
                  const strokeDashoffset = circumference - (category.percentage / 100) * circumference;
                  
                  // Calculate rotation for each segment
                  const previousPercentages = expenseData.categories
                    .slice(0, index)
                    .reduce((sum, cat) => sum + cat.percentage, 0);
                  const rotation = (previousPercentages / 100) * 360;
                  
                  return (
                    <circle
                      key={category.name}
                      cx="21"
                      cy="21"
                      r="15.915"
                      fill="transparent"
                      stroke={color}
                      strokeWidth="3"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      style={{
                        transformOrigin: '21px 21px',
                        transform: `rotate(${rotation}deg)`,
                      }}
                      className="transition-all duration-300"
                    />
                  );
                })}
              </svg>
              
              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-xs text-gray-500">All</p>
                <p className="text-sm font-semibold text-gray-900">
                  {currencySymbol} {expenseData.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">No expenses in the last 30 days</p>
            </div>
          </div>
        )}
        
        {/* Category legend */}
        {expenseData.categories.length > 0 && (
          <div className="mt-4 space-y-2">
            {expenseData.categories.map((category, index) => (
              <div key={category.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: colors[index % colors.length] }}
                  />
                  <span className="text-sm text-gray-600">{category.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {currencySymbol}{category.amount.toFixed(2)} ({category.percentage.toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-20 right-4 z-40">
        <button 
          onClick={onAddTransaction}
          className="bg-blue-500 hover:bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>
      {isAddingAccount && <AddAccountForm onClose={() => setIsAddingAccount(false)} />}
      {isManagingAccounts && <ManageAccountsModal onClose={() => setIsManagingAccounts(false)} />}
    </div>
  );
};

export default ModernDashboard;

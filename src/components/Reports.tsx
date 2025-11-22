import React, { useState, useMemo, useEffect } from 'react';
import { Transaction } from '@/types';
import { useAccounts } from '@/context/AccountContext';
import { useCurrency } from '@/context/CurrencyContext';

interface ReportsProps {
  transactions: Transaction[];
  initialAccountId?: string;
}

const Reports: React.FC<ReportsProps> = ({ transactions, initialAccountId }) => {
  const { accounts } = useAccounts();
  const { currency } = useCurrency();
  const [selectedAccountId, setSelectedAccountId] = useState<string>(initialAccountId ?? 'all');

  useEffect(() => {
    setSelectedAccountId(initialAccountId ?? 'all');
  }, [initialAccountId]);
  
  const currencySymbol = currency === 'INR' ? '₹' : '$';
  const accountMap = new Map(accounts.map(acc => [acc.id, acc]));

  // Filter transactions based on selected account
  const filteredTransactions = useMemo(() => {
    if (selectedAccountId === 'all') {
      return transactions;
    }
    return transactions.filter(t => t.accountId === selectedAccountId);
  }, [transactions, selectedAccountId]);

  // Calculate summary for filtered transactions
  const summary = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return { income, expenses, balance: income - expenses };
  }, [filteredTransactions]);

  return (
    <div className="space-y-6">
      {/* Account Filter */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-dark-text">Filter by Account</h2>
        <select
          value={selectedAccountId}
          onChange={(e) => setSelectedAccountId(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text focus:ring-2 focus:ring-brand-accent focus:border-transparent"
        >
          <option value="all">All Accounts</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </select>
      </div>

      {/* Summary for filtered data */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-dark-text">
          {selectedAccountId === 'all' ? 'Overall Summary' : `${accountMap.get(selectedAccountId)?.name} Summary`}
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-dark-subtle">Income</p>
            <p className="text-lg font-semibold text-income">
              +{currencySymbol}{summary.income.toFixed(2)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-dark-subtle">Expenses</p>
            <p className="text-lg font-semibold text-expense">
              -{currencySymbol}{summary.expenses.toFixed(2)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-dark-subtle">Balance</p>
            <p className={`text-lg font-semibold ${summary.balance >= 0 ? 'text-income' : 'text-expense'}`}>
              {summary.balance >= 0 ? '+' : ''}{currencySymbol}{summary.balance.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-dark-text">
          Transactions {selectedAccountId !== 'all' && `- ${accountMap.get(selectedAccountId)?.name}`}
        </h2>
        {filteredTransactions.length === 0 ? (
          <p className="text-gray-500 dark:text-dark-subtle">
            {selectedAccountId === 'all' 
              ? 'No transactions found.' 
              : `No transactions found for ${accountMap.get(selectedAccountId)?.name}.`
            }
          </p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredTransactions.map((transaction) => {
              const account = accountMap.get(transaction.accountId);
              
              let description = transaction.description;
              if (transaction.description.startsWith('Transfer to')) {
                const toAccount = accountMap.get(transaction.toAccountId || '');
                if (toAccount) {
                  description = `Transfer to ${toAccount.name}`;
                }
              } else if (transaction.description.startsWith('Transfer from')) {
                const fromTransaction = filteredTransactions.find(t => t.id === transaction.id.replace('-to', ''));
                if (fromTransaction) {
                  const fromAccount = accountMap.get(fromTransaction.accountId);
                  if (fromAccount) {
                    description = `Transfer from ${fromAccount.name}`;
                  }
                }
              }

              return (
                <div
                  key={transaction.id}
                  className="flex justify-between items-center py-3 px-4 bg-gray-50 dark:bg-dark-bg rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {account && (
                      <span
                        className="w-2 h-8 rounded-full flex-shrink-0"
                        style={{ backgroundColor: account.color }}
                        title={account.name}
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 dark:text-dark-text truncate">
                        {description}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-dark-subtle">
                        {selectedAccountId === 'all' && (
                          <span className="font-semibold">{account?.name} | </span>
                        )}
                        {transaction.date ? new Date(transaction.date).toLocaleString(undefined, { 
                          year: 'numeric', 
                          month: 'short', 
                          day: '2-digit', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        }) : ''}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`font-semibold text-lg whitespace-nowrap ml-2 ${
                      transaction.type === 'income'
                        ? 'text-income'
                        : 'text-expense'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}{currencySymbol}{transaction.amount.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;

"use client";

import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Transaction } from '../types';
import { useAccounts } from '@/context/AccountContext';

interface AddTransactionFormProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
}

const AddTransactionForm = ({ onAddTransaction }: AddTransactionFormProps) => {
  const { accounts, selectedAccounts } = useAccounts();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense' | 'transfer'>('expense');
  const [date, setDate] = useState<Date | null>(new Date());
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [toAccountId, setToAccountId] = useState<string>('');

  useEffect(() => {
    if (selectedAccounts.length === 1) {
      setSelectedAccountId(selectedAccounts[0].id);
    } else {
      setSelectedAccountId('');
    }
    // Reset toAccountId when the selected account changes to prevent an invalid state
    setToAccountId('');
  }, [selectedAccounts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const amountValue = parseFloat(amount);
    if (!description || !amount || isNaN(amountValue) || amountValue <= 0 || !selectedAccountId) {
      // Basic validation
      alert('Please fill all fields, including selecting an account.');
      return;
    }

    if (type === 'transfer' && !toAccountId) {
      alert('Please select a destination account for the transfer.');
      return;
    }

    if (type === 'transfer' && selectedAccountId === toAccountId) {
      alert('From and To accounts cannot be the same for a transfer.');
      return;
    }

    onAddTransaction({ 
      accountId: selectedAccountId, 
      description, 
      amount: amountValue, 
      type, 
      date: date || new Date(),
      ...(type === 'transfer' && { toAccountId }),
    });

    // Reset form
    setDescription('');
    setAmount('');
    setType('expense');
    setDate(new Date());
    setToAccountId('');
  };

  return (
    <div className="p-4 bg-white dark:bg-dark-bg shadow-md rounded-lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text">Add Transaction</h2>
        
        {selectedAccounts.length > 1 && (
          <div>
            <label htmlFor="account" className="block text-sm font-medium text-gray-500 dark:text-dark-subtle mb-1">Account</label>
            <select
              id="account"
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full px-3 py-2 bg-brand-secondary dark:bg-dark-bg border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent text-gray-900 dark:text-dark-text"
              required
            >
              <option value="" disabled>Select an account</option>
              {accounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-500 dark:text-dark-subtle mb-1">Description</label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 bg-brand-secondary dark:bg-dark-bg border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent text-gray-900 dark:text-dark-text"
            placeholder="e.g., Coffee, Salary"
            required
          />
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-500 dark:text-dark-subtle mb-1">Amount</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 bg-brand-secondary dark:bg-dark-bg border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent text-gray-900 dark:text-dark-text"
            placeholder="0.00"
            required
          />
        </div>

        {type === 'transfer' && (
          <div>
            <label htmlFor="toAccount" className="block text-sm font-medium text-gray-500 dark:text-dark-subtle mb-1">To Account</label>
            <select
              id="toAccount"
              value={toAccountId}
              onChange={(e) => setToAccountId(e.target.value)}
              className="w-full px-3 py-2 bg-brand-secondary dark:bg-dark-bg border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent text-gray-900 dark:text-dark-text"
              required
            >
              <option value="" disabled>Select destination account</option>
              {accounts
                .filter(account => account.id !== selectedAccountId)
                .map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-500 dark:text-dark-subtle mb-1">Date & Time</label>
          <DatePicker
            selected={date}
            onChange={(date: Date | null) => setDate(date)}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="MMMM d, yyyy h:mm aa"
            className="w-full px-3 py-2 bg-brand-secondary dark:bg-dark-bg border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent text-gray-900 dark:text-dark-text"
            placeholderText="Select date and time"
            isClearable
          />
        </div>

        <div>
          <span className="block text-sm font-medium text-gray-500 dark:text-dark-subtle mb-2">Type</span>
          <div className="grid grid-cols-3 gap-2 rounded-lg bg-gray-200 dark:bg-dark-bg p-1">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                type === 'expense' 
                  ? 'bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text shadow'
                  : 'bg-transparent text-gray-600 dark:text-dark-subtle hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                type === 'income' 
                  ? 'bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text shadow'
                  : 'bg-transparent text-gray-600 dark:text-dark-subtle hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Income
            </button>
            <button
              type="button"
              onClick={() => setType('transfer')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                type === 'transfer'
                  ? 'bg-white dark:bg-dark-card text-gray-900 dark:text-dark-text shadow'
                  : 'bg-transparent text-gray-600 dark:text-dark-subtle hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              Transfer
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-brand-accent text-white font-semibold py-3 px-4 rounded-lg hover:bg-brand-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-dark-card focus:ring-brand-accent transition-all duration-200 shadow-sm"
        >
          Add Transaction
        </button>
      </form>
    </div>
  );
};

export default AddTransactionForm;

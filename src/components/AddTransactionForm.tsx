"use client";

import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Transaction } from '../types';
import { useAccounts } from '@/context/AccountContext';
import CustomDropdown, { DropdownOption } from './CustomDropdown';

interface AddTransactionFormProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
}


const AddTransactionForm = ({ onAddTransaction }: AddTransactionFormProps) => {
  const { accounts, selectedAccounts, addAccount } = useAccounts();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense' | 'transfer'>('expense');
  const [date, setDate] = useState<Date | null>(new Date());
  const [selectedAccount, setSelectedAccount] = useState<DropdownOption | null>(null);
  const [toAccount, setToAccount] = useState<DropdownOption | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  const accountOptions = accounts.map(acc => ({ value: acc.id, label: acc.name }));

  useEffect(() => {
    if (selectedAccounts.length === 1) {
      setSelectedAccount({ value: selectedAccounts[0].id, label: selectedAccounts[0].name });
    } else {
      setSelectedAccount(null);
    }
    setToAccount(null);
  }, [selectedAccounts, accounts]);

  const handleCreateAccount = async (inputValue: string) => {
    setIsLoadingOptions(true);
    const newAccount = await addAccount({ 
      name: inputValue, 
      color: '#CCCCCC', // Default color, maybe allow user to pick this later
      opening_balance: 0 
    });
    setIsLoadingOptions(false);
    if (newAccount) {
      const newOption = { value: newAccount.id, label: newAccount.name };
      return newOption;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountValue = parseFloat(amount);
    if (!description || !amount || isNaN(amountValue) || amountValue <= 0 || !selectedAccount) {
      alert('Please fill all fields, including selecting or creating an account.');
      return;
    }

    if (type === 'transfer' && !toAccount) {
      alert('Please select or create a destination account for the transfer.');
      return;
    }

    if (type === 'transfer' && selectedAccount?.value === toAccount?.value) {
      alert('From and To accounts cannot be the same for a transfer.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddTransaction({ 
        accountId: selectedAccount.value, 
        description, 
        amount: amountValue, 
        type, 
        date: (date || new Date()).toISOString(),
        ...(type === 'transfer' && { toAccountId: toAccount?.value }),
      });

      // Reset form on successful submission
      setDescription('');
      setAmount('');
      setType('expense');
      setDate(new Date());
      // Do not reset selectedAccount if only one is selected in context
      if (selectedAccounts.length !== 1) {
        setSelectedAccount(null);
      }
      setToAccount(null);
    } catch (error) {
      console.error('Failed to add transaction', error);
      alert('Failed to add transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="p-4 bg-white dark:bg-dark-bg shadow-md rounded-lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <fieldset disabled={isSubmitting} className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text">Add Transaction</h2>
          
          <div>
            <label htmlFor="account" className="block text-sm font-medium text-gray-500 dark:text-dark-subtle mb-1">Account</label>
            <CustomDropdown
              id="account"
              options={accountOptions}
              value={selectedAccount}
              onChange={setSelectedAccount}
              onCreateOption={handleCreateAccount}
              placeholder="Select or create an account..."
              disabled={isLoadingOptions || (selectedAccounts.length === 1 && !!selectedAccount)}
              loading={isLoadingOptions}
              clearable
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-500 dark:text-dark-subtle mb-1">Description</label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-brand-secondary dark:bg-dark-bg border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent text-gray-900 dark:text-dark-text disabled:opacity-50"
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
              className="w-full px-3 py-2 bg-brand-secondary dark:bg-dark-bg border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent text-gray-900 dark:text-dark-text disabled:opacity-50"
              required
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-dark-subtle mb-1">Type</label>
            <div className="flex items-center space-x-4">
              {(['expense', 'income', 'transfer'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                    type === t
                      ? 'bg-brand-accent text-white'
                      : 'bg-brand-secondary dark:bg-dark-hover text-gray-700 dark:text-dark-text hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {type === 'transfer' && (
            <div>
              <label htmlFor="toAccount" className="block text-sm font-medium text-gray-500 dark:text-dark-subtle mb-1">To Account</label>
              <CustomDropdown
                id="toAccount"
                options={accountOptions.filter(opt => opt.value !== selectedAccount?.value)}
                value={toAccount}
                onChange={setToAccount}
                onCreateOption={handleCreateAccount}
                placeholder="Select or create destination..."
                disabled={isLoadingOptions}
                loading={isLoadingOptions}
                clearable
              />
            </div>
          )}

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-500 dark:text-dark-subtle mb-1">Date</label>
            <DatePicker
              id="date"
              selected={date}
              onChange={(d) => setDate(d)}
              className="w-full px-3 py-2 bg-brand-secondary dark:bg-dark-bg border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-brand-accent text-gray-900 dark:text-dark-text disabled:opacity-50"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="w-full px-4 py-2 bg-brand-accent text-white font-semibold rounded-lg shadow-md hover:bg-brand-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Adding...' : 'Add Transaction'}
            </button>
          </div>
        </fieldset>
      </form>
    </div>
  );
};

export default AddTransactionForm;

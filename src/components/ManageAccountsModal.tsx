'use client';

import React, { useEffect, useState } from 'react';
import { useAccounts } from '@/context/AccountContext';
import { formatOpeningBalanceForDisplay, validateOpeningBalanceInput } from '@/utils/accountValidation';

interface ManageAccountsModalProps {
  onClose: () => void;
}

interface AccountFormState {
  name: string;
  color: string;
  opening_balance: string;
}

export const ManageAccountsModal = ({ onClose }: ManageAccountsModalProps) => {
  const { accounts, updateAccount } = useAccounts();
  const [formState, setFormState] = useState<Record<string, AccountFormState>>({});
  const [status, setStatus] = useState<Record<string, { loading: boolean; error?: string; success?: string }>>({});

  useEffect(() => {
    const nextState: Record<string, AccountFormState> = {};
    accounts.forEach(account => {
      nextState[account.id] = {
        name: account.name,
        color: account.color,
        opening_balance: formatOpeningBalanceForDisplay(account.opening_balance),
      };
    });
    setFormState(nextState);
  }, [accounts]);

  const handleFieldChange = (accountId: string, field: keyof AccountFormState, value: string) => {
    setFormState(prev => ({
      ...prev,
      [accountId]: {
        ...prev[accountId],
        [field]: value,
      },
    }));
    setStatus(prev => ({
      ...prev,
      [accountId]: {
        loading: prev[accountId]?.loading ?? false,
        success: undefined,
        error: undefined,
      },
    }));
  };

  const handleBalanceBlur = (accountId: string) => {
    const current = formState[accountId];
    if (!current) return;
    const validation = validateOpeningBalanceInput(current.opening_balance);
    if (validation.isValid && typeof validation.value === 'number') {
      setFormState(prev => ({
        ...prev,
        [accountId]: {
          ...prev[accountId],
          opening_balance: formatOpeningBalanceForDisplay(validation.value),
        },
      }));
    }
  };

  const handleSave = async (accountId: string) => {
    const current = formState[accountId];
    if (!current) return;

    if (!current.name.trim()) {
      setStatus(prev => ({
        ...prev,
        [accountId]: { loading: false, error: 'Name cannot be empty' },
      }));
      return;
    }

    const balanceValidation = validateOpeningBalanceInput(current.opening_balance);
    if (!balanceValidation.isValid || typeof balanceValidation.value !== 'number') {
      setStatus(prev => ({
        ...prev,
        [accountId]: { loading: false, error: balanceValidation.error || 'Invalid opening balance' },
      }));
      return;
    }

    setStatus(prev => ({ ...prev, [accountId]: { loading: true } }));

    try {
      await updateAccount(accountId, {
        name: current.name.trim(),
        color: current.color || '#3b82f6',
        opening_balance: balanceValidation.value,
      });
      setStatus(prev => ({
        ...prev,
        [accountId]: { loading: false, success: 'Saved' },
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update account';
      setStatus(prev => ({
        ...prev,
        [accountId]: { loading: false, error: message },
      }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-dark-secondary rounded-lg shadow-xl w-full max-w-2xl p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text">Manage Accounts</h2>
            <p className="text-sm text-gray-500 dark:text-dark-subtle mt-1">
              Update names, colors, and opening balances. Changes apply immediately.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-dark-subtle"
            aria-label="Close manage accounts"
          >
            X
          </button>
        </div>

        {accounts.length === 0 ? (
          <p className="mt-6 text-sm text-gray-500 dark:text-dark-subtle">
            No accounts yet. Create one to manage it here.
          </p>
        ) : (
          <div className="mt-6 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {accounts.map(account => {
              const current = formState[account.id];
              const accountStatus = status[account.id];

              if (!current) return null;

              return (
                <div key={account.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-text">Account Name</label>
                      <input
                        type="text"
                        value={current.name}
                        onChange={(e) => handleFieldChange(account.id, 'name', e.target.value)}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-accent focus:border-brand-accent dark:bg-dark-hover dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-text">Color</label>
                      <input
                        type="color"
                        value={current.color}
                        onChange={(e) => handleFieldChange(account.id, 'color', e.target.value)}
                        className="mt-1 w-full h-10 border border-gray-300 dark:border-gray-600 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-text">Opening Balance</label>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={current.opening_balance}
                        onChange={(e) => handleFieldChange(account.id, 'opening_balance', e.target.value)}
                        onBlur={() => handleBalanceBlur(account.id)}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-accent focus:border-brand-accent dark:bg-dark-hover dark:text-white"
                      />
                    </div>
                  </div>
                  {accountStatus?.error && (
                    <p className="mt-2 text-sm text-red-600">{accountStatus.error}</p>
                  )}
                  {accountStatus?.success && (
                    <p className="mt-2 text-sm text-green-600">{accountStatus.success}</p>
                  )}
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleSave(account.id)}
                      className="px-4 py-2 rounded-md text-sm font-medium bg-brand-accent text-white hover:bg-brand-accent-dark disabled:opacity-50"
                      disabled={accountStatus?.loading}
                    >
                      {accountStatus?.loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-hover dark:text-dark-text"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

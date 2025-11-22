'use client';

import React, { useState } from 'react';
import { useAccounts } from '@/context/AccountContext';
import { CirclePicker, ColorResult } from 'react-color';
import { validateOpeningBalanceInput, formatOpeningBalanceForDisplay } from '@/utils/accountValidation';

interface AddAccountFormProps {
  onClose: () => void;
}

export const AddAccountForm = ({ onClose }: AddAccountFormProps) => {
  const { addAccount } = useAccounts();
  const [name, setName] = useState('');
  const [opening_balance, setOpening_balance] = useState('0.00');
  const [color, setColor] = useState('#FF5733'); // Default color
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; opening_balance?: string; form?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const nextErrors: typeof errors = {};
    if (!name.trim()) {
      nextErrors.name = 'Account name is required';
    }

    const balanceValidation = validateOpeningBalanceInput(opening_balance);
    if (!balanceValidation.isValid) {
      nextErrors.opening_balance = balanceValidation.error;
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setIsSubmitting(false);
      return;
    }

    setErrors({});

    try {
      await addAccount({
        name: name.trim(),
        opening_balance: balanceValidation.value ?? 0,
        color,
      });
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add account';
      setErrors({ form: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleColorChange = (color: ColorResult) => {
    setColor(color.hex);
    setErrors(prev => ({ ...prev, form: undefined }));
  };

  const handleOpeningBalanceBlur = () => {
    const validation = validateOpeningBalanceInput(opening_balance);
    if (validation.isValid && typeof validation.value === 'number') {
      setOpening_balance(formatOpeningBalanceForDisplay(validation.value));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm z-50 dark:bg-dark-secondary">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Add New Account</h2>
        <form onSubmit={handleSubmit}>
          <fieldset disabled={isSubmitting} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-dark-text">Account Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors(prev => ({ ...prev, name: undefined, form: undefined }));
                }}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-dark-hover dark:border-gray-600 dark:placeholder-gray-400 dark:text-white disabled:opacity-50 ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                required
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="opening_balance" className="block text-sm font-medium text-gray-700 dark:text-dark-text">Opening Balance</label>
              <input
                type="text"
                id="opening_balance"
                value={opening_balance}
                onChange={(e) => {
                  setOpening_balance(e.target.value);
                  setErrors(prev => ({ ...prev, opening_balance: undefined, form: undefined }));
                }}
                onBlur={handleOpeningBalanceBlur}
                inputMode="decimal"
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-dark-hover dark:border-gray-600 dark:placeholder-gray-400 dark:text-white disabled:opacity-50 ${errors.opening_balance ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                placeholder="0"
              />
              {errors.opening_balance && <p className="mt-1 text-sm text-red-600">{errors.opening_balance}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">Account Color</label>
              <CirclePicker color={color} onChangeComplete={handleColorChange} />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-dark-hover dark:text-dark-text disabled:opacity-50" disabled={isSubmitting}>Cancel</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Account'}
              </button>
            </div>
            {errors.form && <p className="mt-2 text-sm text-red-600">{errors.form}</p>}
          </fieldset>
        </form>
      </div>
    </div>
  );
};

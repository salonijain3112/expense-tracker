'use client';

import React, { useState } from 'react';
import { useAccounts } from '@/context/AccountContext';
import { CirclePicker, ColorResult } from 'react-color';

interface AddAccountFormProps {
  onClose: () => void;
}

export const AddAccountForm = ({ onClose }: AddAccountFormProps) => {
  const { addAccount } = useAccounts();
  const [name, setName] = useState('');
  const [openingBalance, setOpeningBalance] = useState('0');
  const [color, setColor] = useState('#FF5733'); // Default color

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAccount({
      name,
      openingBalance: parseFloat(openingBalance) || 0,
      color,
    });
    onClose();
  };

  const handleColorChange = (color: ColorResult) => {
    setColor(color.hex);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm z-50 dark:bg-dark-secondary">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Add New Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-dark-text">Account Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-dark-hover dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="openingBalance" className="block text-sm font-medium text-gray-700 dark:text-dark-text">Opening Balance</label>
            <input
              type="number"
              id="openingBalance"
              value={openingBalance}
              onChange={(e) => setOpeningBalance(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-dark-hover dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              placeholder="0"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">Account Color</label>
            <CirclePicker color={color} onChangeComplete={handleColorChange} />
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-dark-hover dark:text-dark-text">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Add Account</button>
          </div>
        </form>
      </div>
    </div>
  );
};

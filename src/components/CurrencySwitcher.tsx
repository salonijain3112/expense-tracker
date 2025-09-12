'use client';

import React from 'react';
import { useCurrency } from '@/context/CurrencyContext';

const CurrencySwitcher = () => {
  const { currency, setCurrency } = useCurrency();

  return (
    <div className="flex items-center">
      <label htmlFor="currency-toggle" className="mr-2 font-medium text-gray-700">
        Currency:
      </label>
      <div className="relative">
        <select
          id="currency-toggle"
          value={currency}
          onChange={(e) => setCurrency(e.target.value as 'INR' | 'USD')}
          className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
        >
          <option value="INR">INR (₹)</option>
          <option value="USD">USD ($)</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg
            className="fill-current h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M5.516 7.548c.436-.446 1.144-.446 1.58 0L10 10.43l2.904-2.882c.436-.446 1.144-.446 1.58 0 .436.446.436 1.17 0 1.615l-3.694 3.668c-.436.446-1.144.446-1.58 0L5.516 9.163c-.436-.445-.436-1.17 0-1.615z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default CurrencySwitcher;

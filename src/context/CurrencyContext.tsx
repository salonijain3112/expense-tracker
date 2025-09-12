'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CurrencyContextType {
  currency: 'INR' | 'USD';
  setCurrency: (currency: 'INR' | 'USD') => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

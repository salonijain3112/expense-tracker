import React from 'react';
import { Account } from '@/types';
import { useCurrency } from '@/context/CurrencyContext';

interface AccountCardProps {
  account: Account;
  balance: number;
  onClick?: () => void;
  isSelected?: boolean;
}

const AccountCard: React.FC<AccountCardProps> = ({ 
  account, 
  balance, 
  onClick, 
  isSelected = false 
}) => {
  const { currency } = useCurrency();
  const currencySymbol = currency === 'INR' ? '₹' : '$';

  return (
    <div
      onClick={onClick}
      className={`text-white p-4 rounded-2xl shadow-lg cursor-pointer transition-all duration-200 hover:scale-105 min-h-[100px] ${
        isSelected ? 'ring-2 ring-white ring-opacity-50' : ''
      }`}
      style={{ backgroundColor: account.color }}
    >
      <div className="flex flex-col h-full">
        <div className="text-xs font-medium opacity-90 mb-1">
            {account.name}
        </div>
        <div className="text-lg font-bold">
          {currencySymbol} {balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>
    </div>
  );
};

export default AccountCard;

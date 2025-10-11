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

  // Define account type colors based on account name patterns
  const getAccountTypeAndColor = (name: string) => {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('bank') || lowerName.includes('hdfc') || lowerName.includes('sbi') || lowerName.includes('central')) {
      return { type: 'BANK', color: 'bg-red-500' };
    } else if (lowerName.includes('savings') || lowerName.includes('saving')) {
      return { type: 'SAVINGS', color: 'bg-orange-500' };
    } else if (lowerName.includes('paypal') || lowerName.includes('paytm') || lowerName.includes('phone pe')) {
      return { type: 'PAYPAL', color: 'bg-blue-500' };
    } else if (lowerName.includes('investment') || lowerName.includes('mutual') || lowerName.includes('zerodha')) {
      return { type: 'INVESTMENTS', color: 'bg-teal-500' };
    } else if (lowerName.includes('cash')) {
      return { type: 'CASH', color: 'bg-green-500' };
    } else if (lowerName.includes('credit') || lowerName.includes('card')) {
      return { type: 'CREDIT CARD', color: 'bg-gray-600' };
    } else if (lowerName.includes('amazon')) {
      return { type: 'AMAZON', color: 'bg-yellow-600' };
    } else {
      return { type: 'OTHER', color: 'bg-purple-500' };
    }
  };

  const { type, color } = getAccountTypeAndColor(account.name);

  return (
    <div
      onClick={onClick}
      className={`${color} text-white p-4 rounded-2xl shadow-lg cursor-pointer transition-all duration-200 hover:scale-105 ${
        isSelected ? 'ring-2 ring-white ring-opacity-50' : ''
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="text-xs font-medium opacity-90 mb-1">
          {type}
        </div>
        <div className="text-lg font-bold">
          {currencySymbol} {balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="text-xs opacity-75 mt-1 truncate">
          {account.name}
        </div>
      </div>
    </div>
  );
};

export default AccountCard;

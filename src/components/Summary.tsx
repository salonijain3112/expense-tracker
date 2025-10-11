import { Transaction } from '@/types';
import { useCurrency } from '@/context/CurrencyContext';
import { useAccounts } from '@/context/AccountContext';

interface SummaryProps {
  transactions: Transaction[];
}

const Summary = ({ transactions }: SummaryProps) => {
  const { currency } = useCurrency();
  const { selectedAccounts } = useAccounts();
  const currencySymbol = currency === 'INR' ? '₹' : '$';

  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const expenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const openingBalance = selectedAccounts.reduce((acc, account) => acc + account.opening_balance, 0);
  const balance = openingBalance + income - expenses;

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-dark-text">Financial Summary</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-dark-subtle">Total Income</h3>
          <p className="text-2xl font-semibold text-income">{currencySymbol}{income.toFixed(2)}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-dark-subtle">Total Expenses</h3>
          <p className="text-2xl font-semibold text-expense">{currencySymbol}{expenses.toFixed(2)}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-dark-subtle">Net Balance</h3>
          <p className="text-2xl font-semibold text-gray-900 dark:text-dark-text">{currencySymbol}{balance.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default Summary;

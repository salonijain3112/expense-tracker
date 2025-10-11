import { Transaction } from '@/types';
import { useCurrency } from '@/context/CurrencyContext';
import { useAccounts } from '@/context/AccountContext';

interface TransactionListProps {
  transactions: Transaction[];
}

const TransactionList = ({ transactions }: TransactionListProps) => {
  const { currency } = useCurrency();
  const { accounts } = useAccounts();
  const currencySymbol = currency === 'INR' ? '₹' : '$';

  const accountMap = new Map(accounts.map(acc => [acc.id, acc]));

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-dark-text">Recent Transactions</h2>
      {transactions.length === 0 ? (
        <p className="text-gray-500 dark:text-dark-subtle">No transactions for selected accounts.</p>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-800">
          {transactions.map((transaction) => {
            const account = accountMap.get(transaction.accountId);
            
            let description = transaction.description;
            if (transaction.description.startsWith('Transfer to')) {
              const toAccount = accountMap.get(transaction.toAccountId || '');
              if (toAccount) {
                description = `Transfer to ${toAccount.name}`;
              }
            } else if (transaction.description.startsWith('Transfer from')) {
              const fromTransaction = transactions.find(t => t.id === transaction.id.replace('-to', ''));
              if (fromTransaction) {
                const fromAccount = accountMap.get(fromTransaction.accountId);
                if (fromAccount) {
                  description = `Transfer from ${fromAccount.name}`;
                }
              }
            }

            return (
            <li
              key={transaction.id}
              className="py-4 flex justify-between items-center"
            >
              <div className="flex items-center gap-3">
                {account && (
                  <span
                    className="w-2 h-10 rounded-full flex-shrink-0"
                    style={{ backgroundColor: account.color }}
                    title={account.name}
                  ></span>
                )}
                <div>
                  <p className="font-medium text-gray-900 dark:text-dark-text">{description}</p>
                  <p className="text-sm text-gray-500 dark:text-dark-subtle">
                    <span className="font-semibold">{account?.name}</span>
                    {transaction.date ? ` | ${new Date(transaction.date).toLocaleString(undefined, { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}` : ''}
                  </p>
                </div>
              </div>
              <span
                className={`font-semibold text-lg whitespace-nowrap ${
                  transaction.type === 'income'
                    ? 'text-income'
                    : 'text-expense'
                }`}>
                {transaction.type === 'income' ? '+' : '-'}{currencySymbol}{transaction.amount.toFixed(2)}
              </span>
            </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default TransactionList;

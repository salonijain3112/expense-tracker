export interface Account {
  id: string;
  name: string;
  color: string;
  opening_balance: number;
}

export interface Transaction {
  id: string;
  accountId: string;
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  date?: string; // ISO string format for database compatibility
  toAccountId?: string;
}

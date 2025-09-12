export interface Account {
  id: string;
  name: string;
  color: string;
  openingBalance: number;
}

export interface Transaction {
  id: string;
  accountId: string;
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  date?: Date;
  toAccountId?: string;
}

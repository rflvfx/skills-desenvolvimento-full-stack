export interface Transaction {
  id: number;
  title: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  date: string;
  category: { name: string; color: string };
}

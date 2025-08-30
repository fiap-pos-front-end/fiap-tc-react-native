export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense'
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
}

export interface Transfer {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  date: string;
  notes?: string;
}

export interface DashboardData {
  currentBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  savings: number;
  incomeByCategory: Array<{ categoryName: string; amount: number; icon: string }>;
  expenseByCategory: Array<{ categoryName: string; amount: number; icon: string }>;
}

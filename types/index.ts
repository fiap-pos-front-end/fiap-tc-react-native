export enum TransactionType {
  INCOME = "income",
  EXPENSE = "expense",
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  created: Date;
  updated?: Date;
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
  incomeByCategory: { categoryName: string; amount: number; icon: string }[];
  expenseByCategory: { categoryName: string; amount: number; icon: string }[];
}

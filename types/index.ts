export interface BaseEntity {
  id: string;
  userId?: string;
}

export interface Category extends BaseEntity {
  name: string;
  icon: string;
}

export interface Transfer extends BaseEntity {
  description: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  date: string;
  notes?: string;
}

export enum TransactionType {
  INCOME = "income",
  EXPENSE = "expense",
}

export interface DashboardData {
  currentBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  totalExpense: number;
  totalIncome: number;
  savings: number;
  incomeByCategory: { categoryName: string; amount: number; icon: string }[];
  topIncomeCategory: { categoryName: string; amount: number; icon: string }[];
  topExpenseCategory: { categoryName: string; amount: number; icon: string }[];
  expenseByCategory: { categoryName: string; amount: number; icon: string }[];
  getByCategory: { categoryName: string; expense: number; icon: string; income:number }[];
}

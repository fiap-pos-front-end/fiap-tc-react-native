import { Category, DashboardData, TransactionType, Transfer } from "../types";

export const calculations = {
  getCurrentMonthTransfers(transfers: Transfer[]): Transfer[] {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return transfers.filter((transfer) => {
      const transferDate = new Date(transfer.date);
      return (
        transferDate.getMonth() === currentMonth &&
        transferDate.getFullYear() === currentYear
      );
    });
  },

  calculateMonthlyIncome(transfers: Transfer[]): number {
    const currentMonthTransfers = this.getCurrentMonthTransfers(transfers);
    return currentMonthTransfers
      .filter((transfer) => transfer.type === TransactionType.INCOME)
      .reduce((total, transfer) => total + transfer.amount, 0);
  },

  calculateMonthlyExpense(transfers: Transfer[]): number {
    const currentMonthTransfers = this.getCurrentMonthTransfers(transfers);
    return currentMonthTransfers
      .filter((transfer) => transfer.type === TransactionType.EXPENSE)
      .reduce((total, transfer) => total + transfer.amount, 0);
  },

  calculateCurrentBalance(transfers: Transfer[]): number {
    return transfers.reduce((balance, transfer) => {
      if (transfer.type === TransactionType.INCOME) {
        return balance + transfer.amount;
      } else {
        return balance - transfer.amount;
      }
    }, 0);
  },

  calculateSavings(transfers: Transfer[]): number {
    const income = this.calculateMonthlyIncome(transfers);
    const expense = this.calculateMonthlyExpense(transfers);
    return income - expense;
  },

  getIncomeByCategory(
    transfers: Transfer[],
    categories: Category[]
  ): { categoryName: string; amount: number; icon: string }[] {
    const currentMonthTransfers = this.getCurrentMonthTransfers(transfers);
    const incomeTransfers = currentMonthTransfers.filter(
      (transfer) => transfer.type === TransactionType.INCOME
    );

    const categoryMap = new Map<
      string,
      { categoryName: string; amount: number; icon: string }
    >();

    incomeTransfers.forEach((transfer) => {
      const category = categories.find((cat) => cat.id === transfer.categoryId);
      if (category) {
        const existing = categoryMap.get(category.id);
        if (existing) {
          existing.amount += transfer.amount;
        } else {
          categoryMap.set(category.id, {
            categoryName: category.name,
            amount: transfer.amount,
            icon: category.icon,
          });
        }
      }
    });

    return Array.from(categoryMap.values()).sort((a, b) => b.amount - a.amount);
  },

  getExpenseByCategory(
    transfers: Transfer[],
    categories: Category[]
  ): { categoryName: string; amount: number; icon: string }[] {
    const currentMonthTransfers = this.getCurrentMonthTransfers(transfers);
    const expenseTransfers = currentMonthTransfers.filter(
      (transfer) => transfer.type === TransactionType.EXPENSE
    );

    const categoryMap = new Map<
      string,
      { categoryName: string; amount: number; icon: string }
    >();

    expenseTransfers.forEach((transfer) => {
      const category = categories.find((cat) => cat.id === transfer.categoryId);
      if (category) {
        const existing = categoryMap.get(category.id);
        if (existing) {
          existing.amount += transfer.amount;
        } else {
          categoryMap.set(category.id, {
            categoryName: category.name,
            amount: transfer.amount,
            icon: category.icon,
          });
        }
      }
    });

    return Array.from(categoryMap.values()).sort((a, b) => b.amount - a.amount);
  },

  calculateDashboardData(
    transfers: Transfer[],
    categories: Category[]
  ): DashboardData {
    const monthlyIncome = this.calculateMonthlyIncome(transfers);
    const monthlyExpense = this.calculateMonthlyExpense(transfers);
    const currentBalance = this.calculateCurrentBalance(transfers);
    const savings = this.calculateSavings(transfers);

    return {
      currentBalance,
      monthlyIncome,
      monthlyExpense,
      savings,
      incomeByCategory: this.getIncomeByCategory(transfers, categories),
      expenseByCategory: this.getExpenseByCategory(transfers, categories),
    };
  },
};

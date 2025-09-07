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

  getTransfersByMonth(
    transfers: Transfer[],
    month?: number, // 0 = Janeiro, 11 = Dezembro
    year?: number
  ): Transfer[] {
    const now = new Date();
    const targetMonth = month ?? now.getMonth();
    const targetYear = year ?? now.getFullYear();
    return transfers.filter((transfer) => {
      const transferDate = new Date(transfer.date);
      return (
        transferDate.getMonth() === targetMonth &&
        transferDate.getFullYear() === targetYear
      );
    });
  },

  calculateMonthlyIncome(transfers: Transfer[]): number {
    const currentMonthTransfers = this.getTransfersByMonth(transfers);
    return currentMonthTransfers
      .filter((transfer) => transfer.type === TransactionType.INCOME)
      .reduce((total, transfer) => total + transfer.amount, 0);
  },

  calculateMonthlyExpense(transfers: Transfer[]): number {
    const currentMonthTransfers = this.getTransfersByMonth(transfers);
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

  calculateTotalIncome(transfers: Transfer[]): number {
    return transfers
      .filter((transfer) => transfer.type === TransactionType.INCOME)
      .reduce((total, transfer) => total + transfer.amount, 0);
  },

  calculateTotalExpense(transfers: Transfer[]): number {
    return transfers
      .filter((transfer) => transfer.type === TransactionType.EXPENSE)
      .reduce((total, transfer) => total + transfer.amount, 0);
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

  getTopIncomeCategoryAllTime(
    transfers: Transfer[],
    categories: Category[]
  ): { categoryName: string; amount: number; icon: string }[] {
    // Filtra apenas INCOME (todos os períodos)
    const incomeTransfers = transfers.filter(
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

    if (categoryMap.size === 0) {
      return []; // sem incomes
    }

    // encontra a categoria com maior amount
    const topCategory = Array.from(categoryMap.values()).reduce((max, current) =>
      current.amount > max.amount ? current : max
    );

    return [topCategory];
  },

  getTopExpenseCategoryAllTime(
    transfers: Transfer[],
    categories: Category[]
  ): { categoryName: string; amount: number; icon: string }[] {
    // Filtra apenas INCOME (todos os períodos)
    const incomeTransfers = transfers.filter(
      (transfer) => transfer.type === TransactionType.EXPENSE
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

    if (categoryMap.size === 0) {
      return []; // sem incomes
    }

    // encontra a categoria com maior amount
    const topCategory = Array.from(categoryMap.values()).reduce((max, current) =>
      current.amount > max.amount ? current : max
    );

    return [topCategory];
  },

  calculateDashboardData(
    transfers: Transfer[],
    categories: Category[]
  ): DashboardData {
    const monthlyIncome = this.calculateMonthlyIncome(transfers);
    const monthlyExpense = this.calculateMonthlyExpense(transfers);
    const currentBalance = this.calculateCurrentBalance(transfers);
    const savings = this.calculateSavings(transfers);
    const totalExpense = this.calculateTotalExpense(transfers);
    const totalIncome = this.calculateTotalIncome(transfers);
    
    return {
      currentBalance,
      monthlyIncome,
      monthlyExpense,
      savings,
      totalExpense,
      totalIncome,
      topIncomeCategory: this.getTopIncomeCategoryAllTime(transfers, categories),
      topExpenseCategory: this.getTopExpenseCategoryAllTime(transfers, categories),
      incomeByCategory: this.getIncomeByCategory(transfers, categories),
      expenseByCategory: this.getExpenseByCategory(transfers, categories),
    };
  },
};

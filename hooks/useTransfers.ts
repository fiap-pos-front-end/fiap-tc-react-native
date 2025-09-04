import { TransactionType, Transfer } from "../types";
import { useFirebaseCRUD } from "./firebase/useFirebaseCRUD";

export function useTransfers() {
  const {
    data: transfers,
    loading,
    error,
    create,
    update,
    remove,
    findById: getTransferById,
    clear,
    refresh,
  } = useFirebaseCRUD<Transfer>("transfers", "date");

  const addTransfer = async (transferData: Omit<Transfer, "id">) => {
    return await create(transferData);
  };

  const updateTransfer = async (transfer: Transfer) => {
    return await update(transfer.id, {
      description: transfer.description,
      amount: transfer.amount,
      type: transfer.type,
      categoryId: transfer.categoryId,
      date: transfer.date,
      notes: transfer.notes,
    });
  };

  const deleteTransfer = async (transferId: string) => {
    return await remove(transferId);
  };

  const getIncomeTransfers = () => {
    return transfers.filter(
      (transfer) => transfer.type === TransactionType.INCOME
    );
  };

  const getExpenseTransfers = () => {
    return transfers.filter(
      (transfer) => transfer.type === TransactionType.EXPENSE
    );
  };

  const getTransfersByCategory = (categoryId: string) => {
    return transfers.filter((transfer) => transfer.categoryId === categoryId);
  };

  const getTransfersByPeriod = (startDate: string, endDate: string) => {
    return transfers.filter(
      (transfer) => transfer.date >= startDate && transfer.date <= endDate
    );
  };

  const getTotalIncome = () => {
    return getIncomeTransfers().reduce(
      (total, transfer) => total + transfer.amount,
      0
    );
  };

  const getTotalExpense = () => {
    return getExpenseTransfers().reduce(
      (total, transfer) => total + transfer.amount,
      0
    );
  };

  const getBalance = () => {
    return getTotalIncome() - getTotalExpense();
  };

  const seedTransfers = async (): Promise<void> => {
    const defaultTransfers: Omit<Transfer, "id">[] = [
      {
        description: "Salário",
        amount: 5000,
        type: TransactionType.INCOME,
        categoryId: "salary-category",
        date: new Date().toISOString().split("T")[0],
        notes: "Salário mensal",
      },
      {
        description: "Supermercado",
        amount: 300,
        type: TransactionType.EXPENSE,
        categoryId: "food-category",
        date: new Date().toISOString().split("T")[0],
        notes: "Compras do mês",
      },
      {
        description: "Gasolina",
        amount: 150,
        type: TransactionType.EXPENSE,
        categoryId: "transport-category",
        date: new Date().toISOString().split("T")[0],
      },
    ];

    if (transfers.length === 0) {
      for (const transfer of defaultTransfers) {
        await create(transfer);
      }
    }
  };

  return {
    transfers,
    loading,
    error,
    addTransfer,
    updateTransfer,
    deleteTransfer,
    getTransferById,
    getIncomeTransfers,
    getExpenseTransfers,
    getTransfersByCategory,
    getTransfersByPeriod,
    getTotalIncome,
    getTotalExpense,
    getBalance,
    seedTransfers,
    clearAllTransfers: clear,
    refreshTransfers: refresh,
  };
}

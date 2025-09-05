import { useCallback, useEffect, useState } from "react";
import { TransactionType, Transfer } from "../types";
import { useAuth } from "./firebase/useAuth";
import {
  useFirebaseCRUD,
  useFirestoreCollection,
} from "./firebase/useFirebaseCRUD";
import { useForceReset } from "./useForceReset";

export function useTransfers() {
  const { user } = useAuth();
  const { forceCompleteReset } = useForceReset();

  const [refreshKey, setRefreshKey] = useState(0);

  const {
    data: transfers,
    loading,
    error,
    addDocument,
    queryDocuments,
  } = useFirestoreCollection<Transfer>("transfers", "date");

  const { update: updateDoc, remove: removeDoc } = useFirebaseCRUD<Transfer>();

  useEffect(() => {
    if (!user) {
      setRefreshKey((prev) => prev + 1);
    }
  }, [user]);

  useEffect(() => {
    setRefreshKey((prev) => prev + 1);
  }, [transfers.length, loading, error]);

  const addTransfer = useCallback(
    async (transferData: Omit<Transfer, "id" | "userId">) => {
      try {
        const id = await addDocument(transferData);
        setRefreshKey((prev) => prev + 1);
        return id;
      } catch (error) {
        console.error("Erro ao adicionar transferência:", error);
        throw error;
      }
    },
    [addDocument]
  );

  const updateTransfer = useCallback(
    async (transfer: Transfer) => {
      try {
        await updateDoc("transfers", transfer.id, {
          description: transfer.description,
          amount: transfer.amount,
          type: transfer.type,
          categoryId: transfer.categoryId,
          date: transfer.date,
          notes: transfer.notes,
        });
        setRefreshKey((prev) => prev + 1);
      } catch (error) {
        console.error("Erro ao atualizar transferência:", error);
        throw error;
      }
    },
    [updateDoc]
  );

  const deleteTransfer = useCallback(
    async (transferId: string) => {
      try {
        await removeDoc("transfers", transferId);
        setRefreshKey((prev) => prev + 1);
      } catch (error) {
        console.error("Erro ao deletar transferência:", error);
        throw error;
      }
    },
    [removeDoc]
  );

  const getTransferById = useCallback(
    (transferId: string): Transfer | undefined => {
      return transfers.find((transfer) => transfer.id === transferId);
    },
    [transfers]
  );

  const getTransfersByCategory = useCallback(
    async (categoryId: string) => {
      try {
        return await queryDocuments("categoryId", "==", categoryId);
      } catch (error) {
        console.error("Erro ao buscar transferências por categoria:", error);
        throw error;
      }
    },
    [queryDocuments]
  );

  const getTransfersByType = useCallback(
    async (type: TransactionType) => {
      try {
        return await queryDocuments("type", "==", type);
      } catch (error) {
        console.error("Erro ao buscar transferências por tipo:", error);
        throw error;
      }
    },
    [queryDocuments]
  );

  const getTransfersByDateRange = useCallback(
    (startDate: string, endDate: string): Transfer[] => {
      return transfers.filter(
        (transfer) => transfer.date >= startDate && transfer.date <= endDate
      );
    },
    [transfers]
  );

  const getTotalBalance = useCallback((): number => {
    return transfers.reduce((total, transfer) => {
      return transfer.type === TransactionType.INCOME
        ? total + transfer.amount
        : total - transfer.amount;
    }, 0);
  }, [transfers]);

  const getTotalIncome = useCallback((): number => {
    return transfers
      .filter((t) => t.type === TransactionType.INCOME)
      .reduce((total, transfer) => total + transfer.amount, 0);
  }, [transfers]);

  const getTotalExpenses = useCallback((): number => {
    return transfers
      .filter((t) => t.type === TransactionType.EXPENSE)
      .reduce((total, transfer) => total + transfer.amount, 0);
  }, [transfers]);

  const getMonthlyResume = useCallback(
    (year: number, month: number) => {
      const startDate = `${year}-${month.toString().padStart(2, "0")}-01`;
      const endDate = `${year}-${month.toString().padStart(2, "0")}-31`;

      const monthlyTransfers = getTransfersByDateRange(startDate, endDate);

      const income = monthlyTransfers
        .filter((t) => t.type === TransactionType.INCOME)
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = monthlyTransfers
        .filter((t) => t.type === TransactionType.EXPENSE)
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        income,
        expenses,
        balance: income - expenses,
        transactions: monthlyTransfers.length,
      };
    },
    [getTransfersByDateRange]
  );

  const refreshTransfers = useCallback(async () => {
    try {
      await forceCompleteReset();
      setRefreshKey((prev) => prev + 1);

      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Erro ao atualizar transferências:", error);
      throw error;
    }
  }, [forceCompleteReset]);

  return {
    transfers,
    loading,
    error,

    addTransfer,
    updateTransfer,
    deleteTransfer,
    getTransferById,

    getTransfersByCategory,
    getTransfersByType,
    getTransfersByDateRange,

    getTotalBalance,
    getTotalIncome,
    getTotalExpenses,
    getMonthlyResume,

    refreshTransfers,

    refreshKey,
    isAuthenticated: !!user,
  };
}

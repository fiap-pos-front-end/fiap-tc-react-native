import { useCallback, useMemo } from "react";
import { TransactionType, Transfer } from "../types";
import { useAuth } from "./firebase/useAuth";
import {
  useFirebaseCRUD,
  useFirestoreCollection,
  useFirestoreInfinite,
} from "./firebase/useFirebaseCRUD";

export type TransferFilters = {
  categoryId?: string;
  type?: TransactionType;
  search?: string;
  startDate?: string;
  endDate?: string;
};

type UseTransfersOptions = {
  usePaged?: boolean;
  pageSize?: number;
  mode?: "snapshot" | "values";
  filters?: TransferFilters;
};

export function useTransfersCore(opts: UseTransfersOptions = {}) {
  const { user } = useAuth();
  const { usePaged = true, pageSize = 10, mode = "snapshot", filters = {} } = opts;


  const orderBy = useMemo(() => ["date", "id"], []);

  const applyFilters = useCallback(
    (list: Transfer[]): Transfer[] => {
      return list.filter((t) => {
        if (filters.categoryId && t.categoryId !== filters.categoryId) return false;
        if (filters.type && t.type !== filters.type) return false;
        if (filters.search) {
          const s = filters.search.toLowerCase();
          if (!t.description?.toLowerCase().includes(s) &&
              !t.notes?.toLowerCase().includes(s)) return false;
        }
        if (filters.startDate && t.date < filters.startDate) return false;
        if (filters.endDate && t.date > filters.endDate) return false;
        return true;
      });
    },
    [filters]
  );

  const realtime = useFirestoreCollection<Transfer>("transfers", "date");
  const infinite = useFirestoreInfinite<Transfer>(
    "transfers",
    { orderBy, direction: "desc", limit: pageSize },
    mode
  );

  const transfersRaw = usePaged ? infinite.data : realtime.data;
  const transfers = useMemo(() => applyFilters(transfersRaw), [transfersRaw, applyFilters]);

  const loading = usePaged ? infinite.loading : realtime.loading;
  const error = usePaged ? infinite.error : realtime.error;

  const { update: updateDoc, remove: removeDoc, queryCollection } =
    useFirebaseCRUD<Transfer>();

  const addTransfer = useCallback(
    async (transferData: Omit<Transfer, "id" | "userId">) => {
      const id = await realtime.addDocument(transferData);
      if (usePaged) await infinite.onRefresh?.();
      return id;
    },
    [realtime.addDocument, usePaged, infinite.onRefresh]
  );

  const updateTransfer = useCallback(
    async (transfer: Transfer) => {
      await updateDoc("transfers", transfer.id, {
        description: transfer.description,
        amount: transfer.amount,
        type: transfer.type,
        categoryId: transfer.categoryId,
        date: transfer.date,
        notes: transfer.notes,
      });
      if (usePaged) await infinite.onRefresh?.();
    },
    [updateDoc, usePaged, infinite.onRefresh]
  );

  const deleteTransfer = useCallback(
    async (transferId: string) => {
      await removeDoc("transfers", transferId);
      if (usePaged) await infinite.onRefresh?.();
    },
    [removeDoc, usePaged, infinite.onRefresh]
  );

  const getTransferById = useCallback(
    (transferId: string): Transfer | undefined =>
      transfers.find((t) => t.id === transferId),
    [transfers]
  );

  const getTransfersByCategory = useCallback(
    async (categoryId: string) => {
      return await queryCollection("transfers", "categoryId", "==", categoryId);
    },
    [queryCollection]
  );

  const getTransfersByType = useCallback(
    async (type: TransactionType) => {
      return await queryCollection("transfers", "type", "==", type);
    },
    [queryCollection]
  );

  const getTransfersByDateRange = useCallback(
    (startDate: string, endDate: string): Transfer[] =>
      transfers.filter((t) => t.date >= startDate && t.date <= endDate),
    [transfers]
  );

  const getTotalBalance = useCallback(
    (): number =>
      transfers.reduce(
        (total, t) =>
          t.type === TransactionType.INCOME
            ? total + t.amount
            : total - t.amount,
        0
      ),
    [transfers]
  );

  const getTotalIncome = useCallback(
    (): number =>
      transfers
        .filter((t) => t.type === TransactionType.INCOME)
        .reduce((sum, t) => sum + t.amount, 0),
    [transfers]
  );

  const getTotalExpenses = useCallback(
    (): number =>
      transfers
        .filter((t) => t.type === TransactionType.EXPENSE)
        .reduce((sum, t) => sum + t.amount, 0),
    [transfers]
  );

  const getMonthlyResume = useCallback(
    (year: number, month: number) => {
      const startDate = `${year}-${month.toString().padStart(2, "0")}-01`;
      const endDate = `${year}-${month.toString().padStart(2, "0")}-31`;
      const monthly = getTransfersByDateRange(startDate, endDate);

      const income = monthly
        .filter((t) => t.type === TransactionType.INCOME)
        .reduce((s, t) => s + t.amount, 0);
      const expenses = monthly
        .filter((t) => t.type === TransactionType.EXPENSE)
        .reduce((s, t) => s + t.amount, 0);

      return {
        income,
        expenses,
        balance: income - expenses,
        transactions: monthly.length,
      };
    },
    [getTransfersByDateRange]
  );

  const refreshTransfers = useCallback(async () => {
    if (usePaged) {
      await infinite.onRefresh?.();
    }
  }, [usePaged, infinite.onRefresh]);

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
    hasNext: usePaged ? infinite.hasNext : false,
    loadMore: usePaged ? infinite.onEndReached : undefined,
    loadingMore: usePaged ? infinite.loadingMore : false,
    isAuthenticated: !!user,
  };
}

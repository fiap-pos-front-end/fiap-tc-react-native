import React, { createContext, ReactNode, useContext } from "react";
import { useTransfersCore, TransferFilters } from "../hooks/useTransfers";
import { TransactionType, Transfer } from "../types";

interface TransferContextType {
  transfers: Transfer[];
  loading: boolean;
  error: string | null;
  addTransfer: (transferData: Omit<Transfer, "id" | "userId">) => Promise<string>;
  updateTransfer: (transfer: Transfer) => Promise<void>;
  deleteTransfer: (transferId: string) => Promise<void>;
  getTransferById: (id: string) => Transfer | undefined;
  getTransfersByCategory: (categoryId: string) => Promise<Transfer[]>;
  getTransfersByType: (type: TransactionType) => Promise<Transfer[]>;
  getTransfersByDateRange: (startDate: string, endDate: string) => Transfer[];
  getTotalIncome: () => number;
  getTotalExpenses: () => number;
  getTotalBalance: () => number;
  getMonthlyResume: (year: number, month: number) => {
    income: number;
    expenses: number;
    balance: number;
    transactions: number;
  };
  refreshTransfers: () => Promise<void>;
  hasNext?: boolean;
  loadMore?: () => void;
  loadingMore?: boolean;
  isAuthenticated: boolean;
}

const TransferContext = createContext<TransferContextType | undefined>(undefined);

export function TransferProvider({
  children,
  usePaged = true,
  pageSize = 10,
  mode = "snapshot",
  filters = {},
}: {
  children: ReactNode;
  usePaged?: boolean;
  pageSize?: number;
  mode?: "snapshot" | "values";
  filters?: TransferFilters;
}) {
  const transferData = useTransfersCore({ usePaged, pageSize, mode, filters });

  return (
    <TransferContext.Provider value={transferData as TransferContextType}>
      {children}
    </TransferContext.Provider>
  );
}

export function useTransfers(): TransferContextType {
  const ctx = useContext(TransferContext);
  if (!ctx) throw new Error("useTransfers must be used within a TransferProvider");
  return ctx;
}

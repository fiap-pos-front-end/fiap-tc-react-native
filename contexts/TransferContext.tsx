import React, { createContext, ReactNode, useContext } from "react";
import { useTransfers as useTransfersHook } from "../hooks/useTransfers";
import { Transfer } from "../types";

interface TransferContextType {
  transfers: Transfer[];
  loading: boolean;
  error: string | null;
  addTransfer: (transferData: Omit<Transfer, "id">) => Promise<string>;
  updateTransfer: (transfer: Transfer) => Promise<void>;
  deleteTransfer: (transferId: string) => Promise<void>;
  getTransferById: (id: string) => Transfer | undefined;
  getIncomeTransfers: () => Transfer[];
  getExpenseTransfers: () => Transfer[];
  getTransfersByCategory: (categoryId: string) => Transfer[];
  getTransfersByPeriod: (startDate: string, endDate: string) => Transfer[];
  getTotalIncome: () => number;
  getTotalExpense: () => number;
  getBalance: () => number;
  seedTransfers: () => Promise<void>;
  refreshTransfers: () => Promise<void>;
}

const TransferContext = createContext<TransferContextType | undefined>(
  undefined
);

export function TransferProvider({ children }: { children: ReactNode }) {
  const transferData = useTransfersHook();

  return (
    <TransferContext.Provider value={transferData}>
      {children}
    </TransferContext.Provider>
  );
}

export function useTransfers(): TransferContextType {
  const context = useContext(TransferContext);
  if (context === undefined) {
    throw new Error("useTransfers must be used within a TransferProvider");
  }
  return context;
}

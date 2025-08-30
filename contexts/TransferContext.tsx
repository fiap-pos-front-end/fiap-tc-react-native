import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { TransactionType, Transfer } from '../types';
import { storage } from '../utils/storage';

interface TransferContextType {
  transfers: Transfer[];
  loading: boolean;
  error: string | null;
  addTransfer: (transfer: Omit<Transfer, 'id'>) => Promise<void>;
  updateTransfer: (transfer: Transfer) => Promise<void>;
  deleteTransfer: (id: string) => Promise<void>;
  getTransferById: (id: string) => Transfer | undefined;
  getTransfersByType: (type: TransactionType) => Transfer[];
  getTransfersByCategory: (categoryId: string) => Transfer[];
  loadTransfers: () => Promise<void>;
  seedTransfers: () => Promise<void>;
}

const TransferContext = createContext<TransferContextType | undefined>(undefined);

export const useTransfers = () => {
  const context = useContext(TransferContext);
  if (!context) {
    throw new Error('useTransfers must be used within a TransferProvider');
  }
  return context;
};

interface TransferProviderProps {
  children: ReactNode;
}

export const TransferProvider: React.FC<TransferProviderProps> = ({ children }) => {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTransfers = async () => {
    try {
      setLoading(true);
      setError(null);
      const transfersData = await storage.getTransfers();
      setTransfers(transfersData);
    } catch (error) {
      setError('Failed to load transfers');
    } finally {
      setLoading(false);
    }
  };

  const addTransfer = async (transferData: Omit<Transfer, 'id'>) => {
    try {
      const newTransfer: Transfer = {
        ...transferData,
        id: Date.now().toString(),
      };

      const updatedTransfers = [...transfers, newTransfer];
      await storage.saveTransfers(updatedTransfers);
      setTransfers(updatedTransfers);
    } catch (error) {
      setError('Failed to add transfer');
      throw error;
    }
  };

  const updateTransfer = async (transfer: Transfer) => {
    try {
      const updatedTransfers = transfers.map((t) => (t.id === transfer.id ? transfer : t));
      await storage.saveTransfers(updatedTransfers);
      setTransfers(updatedTransfers);
    } catch (error) {
      setError('Failed to update transfer');
      throw error;
    }
  };

  const deleteTransfer = async (id: string) => {
    try {
      const updatedTransfers = transfers.filter((t) => t.id !== id);
      await storage.saveTransfers(updatedTransfers);
      setTransfers(updatedTransfers);
    } catch (error) {
      setError('Failed to delete transfer');
      throw error;
    }
  };

  const getTransferById = (id: string): Transfer | undefined => {
    return transfers.find((transfer) => transfer.id === id);
  };

  const getTransfersByType = (type: TransactionType): Transfer[] => {
    return transfers.filter((transfer) => transfer.type === type);
  };

  const getTransfersByCategory = (categoryId: string): Transfer[] => {
    return transfers.filter((transfer) => transfer.categoryId === categoryId);
  };

  const seedTransfers = async () => {
    try {
      setLoading(true);
      setError(null);
      const { seedData } = await import('../utils/seedData');
      await storage.saveTransfers(seedData.transfers);
      setTransfers(seedData.transfers);
    } catch (error) {
      setError('Failed to seed transfers');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransfers();
  }, []);

  const value: TransferContextType = {
    transfers,
    loading,
    error,
    addTransfer,
    updateTransfer,
    deleteTransfer,
    getTransferById,
    getTransfersByType,
    getTransfersByCategory,
    loadTransfers,
    seedTransfers,
  };

  return <TransferContext.Provider value={value}>{children}</TransferContext.Provider>;
};

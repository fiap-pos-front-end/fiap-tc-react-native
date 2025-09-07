import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { DashboardData } from '../types';
import { calculations } from '../utils/calculations';
import { useCategories } from './CategoryContext';
import { useTransfers } from './TransferContext';

interface DashboardContextType {
  dashboardData: DashboardData;
  loading: boolean;
  error: string | null;
  refreshDashboard: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

interface DashboardProviderProps {
  children: ReactNode;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({ children }) => {
  const { categories } = useCategories();
  const { transfers } = useTransfers();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    currentBalance: 0,
    monthlyIncome: 0,
    monthlyExpense: 0,
    savings: 0,
    incomeByCategory: [],
    expenseByCategory: [],
    topIncomeCategory: [],
    topExpenseCategory: [],
    totalExpense: 0,
    totalIncome: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateDashboardData = () => {
    try {
      setLoading(true);
      setError(null);

      const data = calculations.calculateDashboardData(transfers, categories);
      setDashboardData(data);
    } catch (err) {
      setError('Erro ao calcular os dados do dashboard');
      console.error('Dashboard calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshDashboard = () => {
    calculateDashboardData();
  };

  useEffect(() => {
    calculateDashboardData();
  }, [transfers, categories]);

  const value: DashboardContextType = {
    dashboardData,
    loading,
    error,
    refreshDashboard,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

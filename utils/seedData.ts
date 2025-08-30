import { Category, TransactionType, Transfer } from '../types';

export const seedData = {
  categories: [
    { id: '1', name: 'Casa', type: TransactionType.EXPENSE, icon: '🏠' },
    { id: '2', name: 'Alimentação', type: TransactionType.EXPENSE, icon: '🍽️' },
    { id: '3', name: 'Transporte', type: TransactionType.EXPENSE, icon: '🚗' },
    { id: '4', name: 'Lazer', type: TransactionType.EXPENSE, icon: '🎮' },
    { id: '5', name: 'Salário', type: TransactionType.INCOME, icon: '💰' },
    { id: '6', name: 'Renda Extra', type: TransactionType.INCOME, icon: '💼' },
    { id: '7', name: 'Investimentos', type: TransactionType.INCOME, icon: '📈' },
  ] as Category[],

  transfers: [
    {
      id: '1',
      description: 'Salário',
      amount: 3000.00,
      type: TransactionType.INCOME,
      categoryId: '5',
      date: '2024-01-15',
      notes: 'Salário mensal da empresa XYZ'
    },
    {
      id: '2',
      description: 'Aluguel',
      amount: 1200.00,
      type: TransactionType.EXPENSE,
      categoryId: '1',
      date: '2024-01-10',
      notes: 'Aluguel do apartamento'
    },
    {
      id: '3',
      description: 'Supermercado',
      amount: 450.00,
      type: TransactionType.EXPENSE,
      categoryId: '2',
      date: '2024-01-12',
      notes: 'Compras mensais do supermercado'
    },
    {
      id: '4',
      description: 'Projeto Freelance',
      amount: 500.00,
      type: TransactionType.INCOME,
      categoryId: '6',
      date: '2024-01-08',
      notes: 'Projeto de design para o cliente ABC'
    },
    {
      id: '5',
      description: 'Combustível',
      amount: 150.00,
      type: TransactionType.EXPENSE,
      categoryId: '3',
      date: '2024-01-14',
      notes: 'Abastecimento do carro'
    }
  ] as Transfer[],
};

import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Category, TransactionType } from '../types';
import { storage } from '../utils/storage';

interface CategoryContextType {
  categories: Category[];
  loading: boolean;
  error: string | null;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  getCategoryById: (id: string) => Category | undefined;
  getCategoriesByType: (type: TransactionType) => Category[];
  loadCategories: () => Promise<void>;
  seedCategories: () => Promise<void>;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
};

interface CategoryProviderProps {
  children: ReactNode;
}

export const CategoryProvider: React.FC<CategoryProviderProps> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const categoriesData = await storage.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (categoryData: Omit<Category, 'id'>) => {
    try {
      const newCategory: Category = {
        ...categoryData,
        id: Date.now().toString(),
      };

      const updatedCategories = [...categories, newCategory];
      await storage.saveCategories(updatedCategories);
      setCategories(updatedCategories);
    } catch (error) {
      setError('Failed to add category');
      throw error;
    }
  };

  const updateCategory = async (category: Category) => {
    try {
      const updatedCategories = categories.map((cat) => (cat.id === category.id ? category : cat));
      await storage.saveCategories(updatedCategories);
      setCategories(updatedCategories);
    } catch (error) {
      setError('Failed to update category');
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const updatedCategories = categories.filter((cat) => cat.id !== id);
      await storage.saveCategories(updatedCategories);
      setCategories(updatedCategories);
    } catch (error) {
      setError('Failed to delete category');
      throw error;
    }
  };

  const getCategoryById = (id: string): Category | undefined => {
    return categories.find((cat) => cat.id === id);
  };

  const getCategoriesByType = (type: TransactionType): Category[] => {
    return categories.filter((cat) => cat.type === type);
  };

  const seedCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const { seedData } = await import('../utils/seedData');
      await storage.saveCategories(seedData.categories);
      setCategories(seedData.categories);
    } catch (error) {
      setError('Failed to seed categories');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const value: CategoryContextType = {
    categories,
    loading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    getCategoriesByType,
    loadCategories,
    seedCategories,
  };

  return <CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>;
};

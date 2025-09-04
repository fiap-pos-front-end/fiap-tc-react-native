import { Category } from "@/types";
import React, { createContext, ReactNode, useContext } from "react";
import { useCategories as useFirebaseCategories } from "../hooks/useCategories";

interface CategoryContextType {
  categories: Category[];
  loading: boolean;
  error: string | null;
  addCategory: (
    categoryData: Omit<Category, "id" | "created">
  ) => Promise<string>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  getCategoryById: (id: string) => Category | undefined;
  searchCategories: (searchTerm: string) => Category[];
}

const CategoryContext = createContext<CategoryContextType | undefined>(
  undefined
);

interface CategoryProviderProps {
  children: ReactNode;
}

export function CategoryProvider({ children }: CategoryProviderProps) {
  const categoryData = useFirebaseCategories();

  return (
    <CategoryContext.Provider value={categoryData}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories(): CategoryContextType {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error("useCategories must be used within a CategoryProvider");
  }
  return context;
}

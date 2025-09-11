import React, { createContext, ReactNode, useContext } from "react";
import { useCategories as useCategoriesHook } from "../hooks/useCategories";
import { Category } from "../types";

interface CategoryContextType {
  categories: Category[];
  loading: boolean;
  error: string | null;

  addCategory: (
    categoryData: Omit<Category, "id" | "userId">
  ) => Promise<string>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;

  getCategoryById: (id: string) => Category | undefined;
  searchCategories: (searchTerm: string) => Category[];
  seedCategories: () => Promise<void>;
  refreshCategories: () => Promise<void>;

  hasNext?: boolean;
  loadMore?: () => void;
  loadingMore?: boolean;
}

const CategoryContext = createContext<CategoryContextType | undefined>(
  undefined
);

export function CategoryProvider({
  children,
  usePaged = false,
  pageSize = 20,
  mode = "snapshot",
}: {
  children: ReactNode;
  usePaged?: boolean;
  pageSize?: number;
  mode?: "snapshot" | "values";
}) {
  const categoryData = useCategoriesHook({ usePaged, pageSize, mode });

  return (
    <CategoryContext.Provider value={categoryData as CategoryContextType}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories(): CategoryContextType {
  const ctx = useContext(CategoryContext);
  if (!ctx)
    throw new Error("useCategories must be used within a CategoryProvider");
  return ctx;
}

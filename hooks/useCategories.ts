import { useCallback, useEffect, useState } from "react";
import { Category } from "../types";
import { useAuth } from "./firebase/useAuth";
import {
  useFirebaseCRUD,
  useFirestoreCollection,
} from "./firebase/useFirebaseCRUD";
import { useForceReset } from "./useForceReset";

export function useCategories() {
  const { user } = useAuth();
  const { forceCompleteReset } = useForceReset();

  const [refreshKey, setRefreshKey] = useState(0);

  const {
    data: categories,
    loading,
    error,
    addDocument,
  } = useFirestoreCollection<Category>("categories", "name");

  const { update: updateDoc, remove: removeDoc } = useFirebaseCRUD<Category>();

  useEffect(() => {
    if (!user) {
      setRefreshKey((prev) => prev + 1);
    }
  }, [user]);

  useEffect(() => {
    setRefreshKey((prev) => prev + 1);
  }, [categories.length, loading, error]);

  const addCategory = useCallback(
    async (categoryData: Omit<Category, "id" | "userId">) => {
      try {
        const id = await addDocument(categoryData);
        setRefreshKey((prev) => prev + 1);
        return id;
      } catch (error) {
        console.error("Erro ao adicionar categoria:", error);
        throw error;
      }
    },
    [addDocument]
  );

  const updateCategory = useCallback(
    async (category: Category) => {
      try {
        await updateDoc("categories", category.id, {
          name: category.name,
          icon: category.icon,
        });
        setRefreshKey((prev) => prev + 1);
      } catch (error) {
        console.error("Erro ao atualizar categoria:", error);
        throw error;
      }
    },
    [updateDoc]
  );

  const deleteCategory = useCallback(
    async (categoryId: string) => {
      try {
        await removeDoc("categories", categoryId);
        setRefreshKey((prev) => prev + 1);
      } catch (error) {
        console.error("Erro ao deletar categoria:", error);
        throw error;
      }
    },
    [removeDoc]
  );

  const getCategoryById = useCallback(
    (categoryId: string): Category | undefined => {
      return categories.find((category) => category.id === categoryId);
    },
    [categories]
  );

  const searchCategories = useCallback(
    (searchTerm: string): Category[] => {
      return categories.filter((category) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    },
    [categories]
  );

  const seedCategories = useCallback(async (): Promise<void> => {
    if (!user) {
      console.warn(
        "Usuário não logado, não é possível criar categorias padrão"
      );
      return;
    }

    const defaultCategories: Omit<Category, "id" | "userId">[] = [
      { name: "Alimentação", icon: "🍽️" },
      { name: "Transporte", icon: "🚗" },
      { name: "Saúde", icon: "🏥" },
      { name: "Educação", icon: "📚" },
      { name: "Lazer", icon: "🎮" },
      { name: "Roupas", icon: "👕" },
      { name: "Casa", icon: "🏠" },
      { name: "Salário", icon: "💰" },
      { name: "Investimentos", icon: "📈" },
      { name: "Outros", icon: "📋" },
    ];

    if (categories.length === 0) {
      try {
        for (const category of defaultCategories) {
          await addDocument(category);
        }
        setRefreshKey((prev) => prev + 1);
      } catch (error) {
        console.error("Erro ao criar categorias padrão:", error);
        throw error;
      }
    } else {
    }
  }, [categories, addDocument, user]);

  const clearLocalCache = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  const refreshCategories = useCallback(async () => {
    try {
      await forceCompleteReset();
      setRefreshKey((prev) => prev + 1);

      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Erro ao atualizar categorias:", error);
      throw error;
    }
  }, [forceCompleteReset]);

  return {
    categories,
    loading,
    error,

    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,

    searchCategories,
    seedCategories,

    clearAllCategories: clearLocalCache,
    refreshCategories,

    refreshKey,
    isAuthenticated: !!user,
  };
}

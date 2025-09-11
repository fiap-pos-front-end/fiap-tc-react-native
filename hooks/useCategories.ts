import { useCallback, useMemo } from "react";
import { Category } from "../types";
import { useAuth } from "./firebase/useAuth";
import {
  useFirebaseCRUD,
  useFirestoreCollection,
  useFirestoreInfinite,
} from "./firebase/useFirebaseCRUD";

type UseCategoriesOptions = {
  usePaged?: boolean;
  pageSize?: number;
  mode?: "snapshot" | "values";
};

export function useCategories(opts: UseCategoriesOptions = {}) {
  const { user } = useAuth();
  const { usePaged = false, pageSize = 20, mode = "snapshot" } = opts;

  const orderBy = useMemo(() => ["name", "id"], []);

  const realtime = useFirestoreCollection<Category>("categories", "name");
  const infinite = useFirestoreInfinite<Category>(
    "categories",
    { orderBy, direction: "asc", limit: pageSize },
    mode
  );

  const categories = usePaged ? infinite.data : realtime.data;
  const loading = usePaged ? infinite.loading : realtime.loading;
  const error = usePaged ? infinite.error : realtime.error;

  const { update: updateDoc, remove: removeDoc } = useFirebaseCRUD<Category>();

  const addCategory = useCallback(
    async (categoryData: Omit<Category, "id" | "userId">) => {
      const add = usePaged
        ? async (data: Omit<Category, "id" | "userId">) => {
            const id = (await infinite.options?.limit)
              ? await realtime.addDocument(data)
              : await realtime.addDocument(data);
            await infinite.onRefresh?.();
            return id!;
          }
        : realtime.addDocument;

      const id = await add(categoryData);
      return id;
    },

    [usePaged, realtime.addDocument, infinite.onRefresh]
  );

  const updateCategory = useCallback(
    async (category: Category) => {
      await updateDoc("categories", category.id, {
        name: category.name,
        icon: category.icon,
      });
      if (usePaged) await infinite.onRefresh?.();
    },
    [updateDoc, usePaged, infinite.onRefresh]
  );

  const deleteCategory = useCallback(
    async (categoryId: string) => {
      await removeDoc("categories", categoryId);
      if (usePaged) await infinite.onRefresh?.();
    },
    [removeDoc, usePaged, infinite.onRefresh]
  );

  const getCategoryById = useCallback(
    (categoryId: string): Category | undefined =>
      categories.find((c) => c.id === categoryId),
    [categories]
  );

  const searchCategories = useCallback(
    (searchTerm: string): Category[] => {
      const q = (searchTerm ?? "").trim().toLowerCase();
      if (!q) return categories;
      return categories.filter((c) => (c.name ?? "").toLowerCase().includes(q));
    },
    [categories]
  );

  const seedCategories = useCallback(async (): Promise<void> => {
    if (!user) {
      console.warn("Usuário não logado; seed cancelado.");
      return;
    }
    const defaults: Omit<Category, "id" | "userId">[] = [
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
      await Promise.all(defaults.map((d) => addCategory(d)));
      if (usePaged) await infinite.onRefresh?.();
    }
  }, [user, categories.length, addCategory, usePaged, infinite.onRefresh]);

  const refreshCategories = useCallback(async () => {
    if (usePaged) {
      await infinite.onRefresh?.();
    } else {
    }
  }, [usePaged, infinite.onRefresh]);

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
    refreshCategories,

    hasNext: usePaged ? infinite.hasNext : false,
    loadMore: usePaged ? infinite.onEndReached : undefined,
    loadingMore: usePaged ? infinite.loadingMore : false,

    isAuthenticated: !!user,
  };
}

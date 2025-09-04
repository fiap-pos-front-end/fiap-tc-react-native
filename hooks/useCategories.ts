import { Category } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { firestoreService } from "../services/firestore";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = firestoreService.onCollectionSnapshot<Category>(
      "categories",
      (data) => {
        setCategories(data);
        setLoading(false);
      },
      "created"
    );

    return unsubscribe;
  }, []);

  const addCategory = useCallback(
    async (categoryData: Omit<Category, "id" | "created">) => {
      try {
        setError(null);

        const id = await firestoreService.addDocument<Category>("categories", {
          ...categoryData,
          created: new Date(),
        });

        return id;
      } catch (err) {
        const errorMessage = (err as Error).message;
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    []
  );

  const updateCategory = useCallback(async (category: Category) => {
    try {
      setError(null);

      await firestoreService.updateDocument<Category>(
        "categories",
        category.id,
        {
          name: category.name,
          icon: category.icon,
          updated: new Date(),
        }
      );
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const deleteCategory = useCallback(async (categoryId: string) => {
    try {
      setError(null);

      await firestoreService.deleteDocument("categories", categoryId);
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const getCategoryById = useCallback(
    (id: string): Category | undefined => {
      return categories.find((category) => category.id === id);
    },
    [categories]
  );

  const searchCategories = useCallback(
    (searchTerm: string) => {
      return categories.filter((category) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    },
    [categories]
  );

  return {
    categories,
    loading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    searchCategories,
  };
}

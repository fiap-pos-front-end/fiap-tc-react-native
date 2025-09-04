import { Category } from "../types";
import { useFirebaseCRUD } from "./firebase/useFirebaseCRUD";

export function useCategories() {
  const {
    data: categories,
    loading,
    error,
    create,
    update,
    remove,
    findById: getCategoryById,
    clear,
    refresh,
  } = useFirebaseCRUD<Category>("categories", "name");

  const addCategory = async (categoryData: Omit<Category, "id">) => {
    return await create(categoryData);
  };

  const updateCategory = async (category: Category) => {
    return await update(category.id, {
      name: category.name,
      icon: category.icon,
    });
  };

  const deleteCategory = async (categoryId: string) => {
    return await remove(categoryId);
  };

  const searchCategories = (searchTerm: string) => {
    return categories.filter((category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const seedCategories = async (): Promise<void> => {
    const defaultCategories: Omit<Category, "id">[] = [
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
      for (const category of defaultCategories) {
        await create(category);
      }
    }
  };

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
    clearAllCategories: clear,
    refreshCategories: refresh,
  };
}

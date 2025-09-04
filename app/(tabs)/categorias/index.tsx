// src/screens/CategoriasScreen.tsx
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useCategories } from "@/contexts/CategoryContext";
import { Category } from "@/types";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

export default function CategoriasScreen() {
  const router = useRouter();
  const { categories, loading, error, deleteCategory } = useCategories();

  const handleDeleteCategory = (category: Category) => {
    Alert.alert(
      "Excluir Categoria",
      `Deseja realmente excluir a categoria "${category.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCategory(category.id);
              Alert.alert("Sucesso", "Categoria excluída com sucesso!");
            } catch (error) {
              Alert.alert("Erro", "Falha ao excluir categoria");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color="#007bff" />
        <ThemedText style={styles.loadingText}>
          Carregando categorias...
        </ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.errorText}>Erro: {error}</ThemedText>
      </ThemedView>
    );
  }

  const renderCategoria = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.categoriaItem}
      onPress={() => router.push(`/categorias/detalhes?id=${item.id}` as any)}
      onLongPress={() => handleDeleteCategory(item)}
    >
      <ThemedView style={styles.categoriaInfo}>
        <ThemedText style={styles.icone}>{item.icon}</ThemedText>
        <ThemedView style={styles.categoriaText}>
          <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
          <ThemedText style={styles.dateText}>
            Criado: {item.created?.toLocaleDateString?.("pt-BR") || "N/A"}
          </ThemedText>
        </ThemedView>
      </ThemedView>
      <TouchableOpacity
        style={styles.editButton}
        onPress={(e) => {
          e.stopPropagation();
          router.push(`/categorias/editar?id=${item.id}` as any);
        }}
      >
        <ThemedText style={styles.editButtonText}>✏️</ThemedText>
      </TouchableOpacity>
      <ThemedText style={styles.arrow}>›</ThemedText>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Categorias</ThemedText>
        <ThemedText type="subtitle">
          Gerencie suas categorias financeiras
        </ThemedText>
        <ThemedText style={styles.countText}>
          Total: {categories.length} categoria
          {categories.length !== 1 ? "s" : ""}
        </ThemedText>
      </ThemedView>

      {categories.length === 0 ? (
        <ThemedView style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>📋</ThemedText>
          <ThemedText style={styles.emptyTitle}>
            Nenhuma categoria encontrada
          </ThemedText>
          <ThemedText style={styles.emptySubtitle}>
            Comece criando sua primeira categoria
          </ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={categories}
          renderItem={renderCategoria}
          keyExtractor={(item) => item.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/categorias/nova" as any)}
      >
        <ThemedText style={styles.fabText}>+</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
    marginTop: 20,
  },
  countText: {
    fontSize: 14,
    color: "#6c757d",
    marginTop: 5,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 100,
  },
  categoriaItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    marginBottom: 10,
  },
  categoriaInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  icone: {
    fontSize: 24,
    marginRight: 15,
  },
  categoriaText: {
    flex: 1,
    gap: 4,
    backgroundColor: "#f8f9fa",
  },
  dateText: {
    fontSize: 12,
    color: "#6c757d",
  },
  editButton: {
    padding: 8,
    marginRight: 10,
  },
  editButtonText: {
    fontSize: 18,
  },
  arrow: {
    fontSize: 20,
    color: "#6c757d",
  },
  fab: {
    position: "absolute",
    bottom: 100,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
    zIndex: 1000,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  fabText: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 28,
  },
  loadingText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#6c757d",
  },
  errorText: {
    color: "#dc3545",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#6c757d",
    lineHeight: 22,
  },
});

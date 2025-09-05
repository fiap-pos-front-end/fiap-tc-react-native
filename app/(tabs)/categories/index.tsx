import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useCategories } from "@/contexts/CategoryContext";
import { Category } from "@/types";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

export default function CategoriesListScreen() {
  const router = useRouter();
  const { categories, loading, error, deleteCategory } = useCategories();

  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setRefreshKey((prev) => prev + 1);
  }, [categories.length, loading, error]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);

    try {
      setRefreshKey((prev) => prev + 1);

      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Erro ao atualizar lista:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const handleDeleteCategory = (category: Category) => {
    Alert.alert(
      "Excluir Categoria",
      `Deseja realmente excluir "${category.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCategory(category.id);
              Alert.alert("Sucesso", "Categoria excluída!");

              setRefreshKey((prev) => prev + 1);
            } catch {
              Alert.alert("Erro", "Falha ao excluir categoria");
            }
          },
        },
      ]
    );
  };

  const renderCategory = useCallback(
    ({ item }: { item: Category }) => (
      <TouchableOpacity
        style={styles.categoryItem}
        onPress={() => router.push(`/categories/${item.id}/view`)}
      >
        <ThemedView style={styles.categoryInfo}>
          <ThemedText style={styles.icon}>{item.icon}</ThemedText>
          <ThemedView style={styles.categoryDetails}>
            <ThemedText style={styles.categoryName}>{item.name}</ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              handleDeleteCategory(item);
            }}
          >
            <ThemedText style={styles.actionText}>🗑️</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </TouchableOpacity>
    ),
    [router, handleDeleteCategory]
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <ThemedText style={styles.loadingText}>
            Carregando categorias...
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.centeredContainer}>
          <ThemedText style={styles.errorText}>Erro: {error}</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.container} key={refreshKey}>
        {categories.length === 0 ? (
          <ThemedView style={styles.emptyContainer}>
            <ThemedText style={styles.emptyIcon}>📋</ThemedText>
            <ThemedText style={styles.emptyTitle}>Nenhuma categoria</ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              Toque no + para criar sua primeira categoria
            </ThemedText>
            <ThemedText style={styles.pullToRefreshHint}>
              Puxe para baixo para atualizar
            </ThemedText>
          </ThemedView>
        ) : (
          <FlatList
            data={categories}
            renderItem={renderCategory}
            keyExtractor={(item) => `${item.id}-${refreshKey}`}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            extraData={refreshKey}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                colors={["#007bff"]}
                tintColor="#007bff"
                title="Atualizando..."
                titleColor="#666"
              />
            }
            removeClippedSubviews={false}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={10}
          />
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    paddingBottom: 100,
  },
  categoryItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  icon: {
    fontSize: 24,
    marginRight: 15,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  actionText: {
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#333",
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    lineHeight: 22,
    marginBottom: 10,
  },
  pullToRefreshHint: {
    fontSize: 14,
    textAlign: "center",
    color: "#999",
    fontStyle: "italic",
  },
  loadingText: {
    textAlign: "center",
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    color: "#dc3545",
    fontSize: 16,
    textAlign: "center",
  },
});

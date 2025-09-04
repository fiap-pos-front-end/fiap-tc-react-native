import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useCategories } from "@/contexts/CategoryContext";
import { Category } from "@/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, TouchableOpacity } from "react-native";

export default function DetalhesCategoriaScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getCategoryById, deleteCategory, loading } = useCategories();
  const [category, setCategory] = useState<Category | null>(null);

  useEffect(() => {
    if (id) {
      const categoria = getCategoryById(id);
      if (categoria) {
        setCategory(categoria);
      } else {
        Alert.alert("Erro", "Categoria não encontrada", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    }
  }, [id, getCategoryById]);

  const handleDelete = () => {
    if (!category) return;

    Alert.alert(
      "Excluir Categoria",
      `Tem certeza que deseja excluir a categoria "${category.name}"?\n\nEsta ação não pode ser desfeita.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCategory(category.id);
              Alert.alert("Sucesso", "Categoria excluída com sucesso!", [
                {
                  text: "OK",
                  onPress: () => router.replace("/categorias" as any),
                },
              ]);
            } catch (error) {
              Alert.alert("Erro", "Falha ao excluir categoria");
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    if (category) {
      router.push(`/categorias/editar?id=${category.id}` as any);
    }
  };

  if (!category) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.loadingText}>
          Carregando detalhes...
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        {/* Header com ícone e nome */}
        <ThemedView style={styles.header}>
          <ThemedView style={styles.iconContainer}>
            <ThemedText style={styles.icon}>{category.icon}</ThemedText>
          </ThemedView>
          <ThemedText type="title" style={styles.title}>
            {category.name}
          </ThemedText>
        </ThemedView>

        {/* Informações da categoria */}
        <ThemedView style={styles.infoSection}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Informações
          </ThemedText>

          <ThemedView style={styles.infoCard}>
            <ThemedView style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Nome:</ThemedText>
              <ThemedText style={styles.infoValue}>{category.name}</ThemedText>
            </ThemedView>

            <ThemedView style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Ícone:</ThemedText>
              <ThemedText style={styles.infoValue}>{category.icon}</ThemedText>
            </ThemedView>

            <ThemedView style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>Criado em:</ThemedText>
              <ThemedText style={styles.infoValue}>
                {category.created?.toLocaleDateString?.("pt-BR") || "N/A"}
              </ThemedText>
            </ThemedView>

            {category.updated && (
              <ThemedView style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Atualizado em:</ThemedText>
                <ThemedText style={styles.infoValue}>
                  {category.updated?.toLocaleDateString?.("pt-BR")}
                </ThemedText>
              </ThemedView>
            )}
          </ThemedView>
        </ThemedView>

        {/* Botões de ação */}
        <ThemedView style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEdit}
            disabled={loading}
          >
            <ThemedText style={styles.editButtonText}>✏️ Editar</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            disabled={loading}
          >
            <ThemedText style={styles.deleteButtonText}>🗑️ Excluir</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#e3f2fd",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    textAlign: "center",
    color: "#333",
  },
  infoSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    marginBottom: 15,
    color: "#333",
    fontWeight: "600",
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoLabel: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
  actionsSection: {
    gap: 15,
  },
  editButton: {
    backgroundColor: "#007bff",
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  deleteButton: {
    backgroundColor: "#dc3545",
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  loadingText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#666",
  },
});

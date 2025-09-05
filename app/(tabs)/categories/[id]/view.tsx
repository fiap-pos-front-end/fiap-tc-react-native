import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useCategories } from "@/contexts/CategoryContext";
import { Category } from "@/types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

export default function ViewCategoryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getCategoryById, deleteCategory, loading } = useCategories();
  const [category, setCategory] = useState<Category | null>(null);

  useEffect(() => {
    if (id) {
      const foundCategory = getCategoryById(id);
      if (foundCategory) {
        setCategory(foundCategory);
      } else {
        Alert.alert("Erro", "Categoria não encontrada", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    }
  }, [id, getCategoryById]);

  const handleDelete = () => {
    if (!category) return;

    Alert.alert("Excluir", `Excluir "${category.name}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteCategory(category.id);
            Alert.alert("Sucesso", "Categoria excluída!", [
              { text: "OK", onPress: () => router.replace("/categories") },
            ]);
          } catch {
            Alert.alert("Erro", "Falha ao excluir categoria");
          }
        },
      },
    ]);
  };

  const handleEdit = () => {
    if (category) {
      router.push(`/categories/${category.id}/edit`);
    }
  };

  if (!category) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>Carregando...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <ThemedView style={styles.header}>
          <ThemedText style={styles.name}>{category.name}</ThemedText>
        </ThemedView>

        <ThemedView style={styles.info}>
          <ThemedView style={styles.row}>
            <ThemedText style={styles.label}>Nome</ThemedText>
            <ThemedText style={styles.value}>{category.name}</ThemedText>
          </ThemedView>

          <ThemedView style={styles.row}>
            <ThemedText style={styles.label}>Ícone</ThemedText>
            <ThemedText style={styles.value}>{category.icon}</ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.actions}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={handleEdit}
            disabled={loading}
          >
            <MaterialCommunityIcons name="pencil" size={16} color="#007bff" />
            <ThemedText style={styles.editText}>Editar</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={handleDelete}
            disabled={loading}
          >
            <MaterialCommunityIcons
              name="trash-can-outline"
              size={16}
              color="#dc3545"
            />
            <ThemedText style={styles.deleteText}>Excluir</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    color: "#666",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  header: {
    alignItems: "center",
    padding: 20,
    gap: 8,
  },
  icon: {
    fontSize: 48,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  info: {
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  value: {
    fontSize: 13,
    color: "#333",
    fontWeight: "500",
    textAlign: "right",
    flex: 1,
    marginLeft: 16,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  editBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#007bff",
  },
  deleteBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#dc3545",
  },
  editText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#007bff",
  },
  deleteText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#dc3545",
  },
});

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { getAllIcons } from "@/constants/Icons";
import { useCategories } from "@/contexts/CategoryContext";
import { Category } from "@/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";

export default function EditCategoryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getCategoryById, updateCategory, loading } = useCategories();

  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("📋");
  const [category, setCategory] = useState<Category | null>(null);

  const icons = getAllIcons();

  useEffect(() => {
    if (id) {
      const foundCategory = getCategoryById(id);
      if (foundCategory) {
        setCategory(foundCategory);
        setName(foundCategory.name);
        setSelectedIcon(foundCategory.icon);
      } else {
        Alert.alert("Erro", "Categoria não encontrada", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    }
  }, [id, getCategoryById]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Erro", "Por favor, insira um nome para a categoria");
      return;
    }

    if (!category) return;

    try {
      const updatedCategory: Category = {
        ...category,
        name: name.trim(),
        icon: selectedIcon,
      };

      await updateCategory(updatedCategory);

      Alert.alert("Sucesso", "Categoria atualizada com sucesso!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Erro", "Falha ao atualizar categoria");
    }
  };

  if (!category) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.centeredContainer}>
          <ThemedText style={styles.loadingText}>Carregando...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.content}>
          <ThemedView style={styles.form}>
            <ThemedView style={styles.inputGroup}>
              <ThemedText style={styles.label}>Nome da Categoria</ThemedText>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Ex: Alimentação"
                placeholderTextColor="#999"
                editable={!loading}
              />
            </ThemedView>

            <ThemedView style={styles.inputGroup}>
              <ThemedText style={styles.label}>Ícone</ThemedText>
              <ThemedView style={styles.iconGrid}>
                {icons.map((icon, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.iconButton,
                      selectedIcon === icon && styles.selectedIcon,
                    ]}
                    onPress={() => setSelectedIcon(icon)}
                  >
                    <ThemedText style={styles.iconText}>{icon}</ThemedText>
                  </TouchableOpacity>
                ))}
              </ThemedView>
            </ThemedView>

            <ThemedView style={styles.preview}>
              <ThemedText style={styles.label}>Prévia</ThemedText>
              <ThemedView style={styles.previewItem}>
                <ThemedText style={styles.previewIcon}>
                  {selectedIcon}
                </ThemedText>
                <ThemedText style={styles.previewName}>
                  {name || "Nome da categoria"}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.back()}
              disabled={loading}
            >
              <ThemedText style={styles.cancelButtonText}>Cancelar</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, loading && styles.disabledButton]}
              onPress={handleSave}
              disabled={loading}
            >
              <ThemedText style={styles.saveButtonText}>
                {loading ? "Salvando..." : "Salvar"}
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    color: "#333",
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#e0e0e0",
  },
  selectedIcon: {
    borderColor: "#007bff",
    backgroundColor: "#e3f2fd",
  },
  iconText: {
    fontSize: 24,
  },
  preview: {
    marginBottom: 32,
  },
  previewItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  previewIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  previewName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#007bff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
});

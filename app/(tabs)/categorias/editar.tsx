// src/screens/EditarCategoriaScreen.tsx
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useCategories } from "@/contexts/CategoryContext";
import { Category } from "@/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, TextInput, TouchableOpacity } from "react-native";

export default function EditarCategoriaScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getCategoryById, updateCategory, loading } = useCategories();

  const [nome, setNome] = useState("");
  const [originalCategory, setOriginalCategory] = useState<Category | null>(
    null
  );

  useEffect(() => {
    if (id) {
      const categoria = getCategoryById(id);
      if (categoria) {
        setOriginalCategory(categoria);
        setNome(categoria.name);
      } else {
        Alert.alert("Erro", "Categoria não encontrada", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    }
  }, [id, getCategoryById]);

  const handleSalvar = async () => {
    if (!nome.trim()) {
      Alert.alert("Erro", "Por favor, insira um nome para a categoria");
      return;
    }

    if (!id || !originalCategory) {
      Alert.alert("Erro", "Dados da categoria não encontrados");
      return;
    }

    try {
      const updatedCategory: Category = {
        ...originalCategory,
        name: nome.trim(),
        updated: new Date(),
      };

      await updateCategory(updatedCategory);

      Alert.alert("Sucesso", "Categoria atualizada com sucesso!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert("Erro", "Falha ao atualizar categoria");
      console.error("Erro ao atualizar categoria:", error);
    }
  };

  if (!originalCategory) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.loadingText}>
          Carregando categoria...
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Editar Categoria</ThemedText>
        <ThemedText type="subtitle">Modifique os dados da categoria</ThemedText>
      </ThemedView>

      <ThemedView style={styles.form}>
        <ThemedView style={styles.inputGroup}>
          <ThemedText type="defaultSemiBold">Nome da Categoria</ThemedText>
          <TextInput
            style={styles.input}
            value={nome}
            onChangeText={setNome}
            placeholder="Ex: Alimentação"
            placeholderTextColor="#6c757d"
            editable={!loading}
          />
        </ThemedView>

        <ThemedView style={styles.previewContainer}>
          <ThemedText type="defaultSemiBold">Preview</ThemedText>
          <ThemedView style={styles.previewItem}>
            <ThemedText style={styles.previewIcon}>
              {originalCategory.icon}
            </ThemedText>
            <ThemedText style={styles.previewName}>
              {nome || "Nome da categoria"}
            </ThemedText>
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
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSalvar}
            disabled={loading}
          >
            <ThemedText style={styles.saveButtonText}>
              {loading ? "Salvando..." : "Salvar"}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
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
  form: {
    flex: 1,
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#dee2e6",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: "transparent",
    minHeight: 50,
  },
  previewContainer: {
    gap: 10,
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  previewItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 6,
  },
  previewIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  previewName: {
    fontSize: 16,
    fontWeight: "600",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 15,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#6c757d",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6c757d",
  },
  saveButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#007bff",
  },
  saveButtonDisabled: {
    backgroundColor: "#6c757d",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  loadingText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#6c757d",
  },
});

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { getAllIcons } from "@/constants/Icons";
import { useCategories } from "@/contexts/CategoryContext";
import { Category } from "@/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
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
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = "Campo obrigatório";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearFieldError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
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

      Alert.alert("Sucesso", "Categoria atualizada!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Erro", "Falha ao atualizar categoria");
    }
  };

  if (!category) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#666" />
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <ThemedView style={styles.content}>
            <ThemedView style={styles.field}>
              <ThemedText style={styles.label}>Nome</ThemedText>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  clearFieldError("name");
                }}
                placeholder="Digite o nome da categoria"
                placeholderTextColor="#999"
                editable={!loading}
              />
              {errors.name && (
                <ThemedText style={styles.error}>{errors.name}</ThemedText>
              )}
            </ThemedView>

            <ThemedView style={styles.field}>
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

            <ThemedView style={styles.field}>
              <ThemedText style={styles.label}>Prévia</ThemedText>
              <ThemedView style={styles.preview}>
                <ThemedText style={styles.previewIcon}>
                  {selectedIcon}
                </ThemedText>
                <ThemedText style={styles.previewName}>
                  {name || "Nome da categoria"}
                </ThemedText>
              </ThemedView>
            </ThemedView>

            <ThemedView style={styles.actions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => router.back()}
                disabled={loading}
              >
                <ThemedText style={styles.cancelTxt}>Cancelar</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveBtn, loading && styles.disabled]}
                onPress={handleSave}
                disabled={loading}
              >
                {loading && <ActivityIndicator size="small" color="#fff" />}
                <ThemedText style={styles.saveTxt}>
                  {loading ? "Salvando" : "Salvar"}
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  keyboardView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 16,
    gap: 16,
    minHeight: "100%",
  },
  field: {
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    backgroundColor: "#fff",
    color: "#333",
  },
  inputError: {
    borderColor: "#dc3545",
  },
  error: {
    fontSize: 11,
    color: "#dc3545",
    marginTop: 2,
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  selectedIcon: {
    borderColor: "#007bff",
    backgroundColor: "#e3f2fd",
  },
  iconText: {
    fontSize: 18,
  },
  preview: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 6,
    gap: 8,
  },
  previewIcon: {
    fontSize: 18,
  },
  previewName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#999",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  saveBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    padding: 10,
    borderRadius: 6,
    backgroundColor: "#007bff",
  },
  disabled: {
    opacity: 0.6,
  },
  cancelTxt: {
    fontSize: 13,
    fontWeight: "500",
    color: "#666",
  },
  saveTxt: {
    fontSize: 13,
    fontWeight: "500",
    color: "#fff",
  },
});

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { getRandomIcon } from "@/constants/Icons";
import { useCategories } from "@/contexts/CategoryContext";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, TextInput, TouchableOpacity } from "react-native";

export default function NovaCategoriaScreen() {
  const router = useRouter();
  const { addCategory, loading } = useCategories();
  const [nome, setNome] = useState("");

  const handleSalvar = async () => {
    if (!nome.trim()) {
      Alert.alert("Erro", "Por favor, insira um nome para a categoria");
      return;
    }

    try {
      const randomIcon = getRandomIcon();

      await addCategory({
        name: nome.trim(),
        icon: randomIcon,
      });

      Alert.alert("Sucesso", "Categoria criada com sucesso!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert("Erro", "Falha ao criar categoria");
      console.error("Erro ao criar categoria:", error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Nova Categoria</ThemedText>
        <ThemedText type="subtitle">
          Crie uma nova categoria financeira
        </ThemedText>
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
});

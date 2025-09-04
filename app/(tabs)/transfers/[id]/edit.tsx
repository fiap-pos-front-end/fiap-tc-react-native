import { CategoryPicker } from "@/components/CategoryPicker";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useCategories } from "@/contexts/CategoryContext";
import { useTransfers } from "@/contexts/TransferContext";
import { TransactionType, Transfer } from "@/types";
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

export default function EditTransferScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getTransferById, updateTransfer, loading } = useTransfers();
  const { categories } = useCategories();

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [transfer, setTransfer] = useState<Transfer | null>(null);

  useEffect(() => {
    if (id) {
      const foundTransfer = getTransferById(id);
      if (foundTransfer) {
        setTransfer(foundTransfer);
        setDescription(foundTransfer.description);
        setAmount(foundTransfer.amount.toString());
        setType(foundTransfer.type);
        setCategoryId(foundTransfer.categoryId);
        setDate(foundTransfer.date);
        setNotes(foundTransfer.notes || "");
      } else {
        Alert.alert("Erro", "Transferência não encontrada", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    }
  }, [id, getTransferById]);

  const handleSave = async () => {
    if (!description.trim()) {
      Alert.alert("Erro", "Por favor, insira uma descrição");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert("Erro", "Por favor, insira um valor válido");
      return;
    }

    if (!categoryId) {
      Alert.alert("Erro", "Por favor, selecione uma categoria");
      return;
    }

    if (!transfer) return;

    try {
      const updatedTransfer: Transfer = {
        ...transfer,
        description: description.trim(),
        amount: parseFloat(amount),
        type,
        categoryId,
        date,
        notes: notes.trim() || undefined,
      };

      await updateTransfer(updatedTransfer);

      Alert.alert("Sucesso", "Transferência atualizada com sucesso!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert("Erro", "Falha ao atualizar transferência");
    }
  };

  if (!transfer) {
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
              <ThemedText style={styles.label}>Descrição</ThemedText>
              <TextInput
                style={styles.input}
                value={description}
                onChangeText={setDescription}
                placeholder="Ex: Compra no supermercado"
                placeholderTextColor="#999"
                editable={!loading}
              />
            </ThemedView>

            <ThemedView style={styles.inputGroup}>
              <ThemedText style={styles.label}>Valor</ThemedText>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                placeholder="0,00"
                placeholderTextColor="#999"
                keyboardType="numeric"
                editable={!loading}
              />
            </ThemedView>

            <ThemedView style={styles.inputGroup}>
              <ThemedText style={styles.label}>Tipo</ThemedText>
              <ThemedView style={styles.typeContainer}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    type === TransactionType.INCOME && styles.incomeButton,
                  ]}
                  onPress={() => setType(TransactionType.INCOME)}
                >
                  <ThemedText
                    style={[
                      styles.typeText,
                      type === TransactionType.INCOME && styles.activeTypeText,
                    ]}
                  >
                    💰 Receita
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    type === TransactionType.EXPENSE && styles.expenseButton,
                  ]}
                  onPress={() => setType(TransactionType.EXPENSE)}
                >
                  <ThemedText
                    style={[
                      styles.typeText,
                      type === TransactionType.EXPENSE && styles.activeTypeText,
                    ]}
                  >
                    💸 Despesa
                  </ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>

            <ThemedView style={styles.inputGroup}>
              <ThemedText style={styles.label}>Categoria</ThemedText>
              <ThemedView style={styles.pickerContainer}>
                <CategoryPicker
                  categories={categories}
                  selectedCategoryId={categoryId}
                  onCategorySelect={setCategoryId}
                  disabled={loading}
                  placeholder="Selecione uma categoria"
                />
              </ThemedView>
            </ThemedView>

            <ThemedView style={styles.inputGroup}>
              <ThemedText style={styles.label}>Data</ThemedText>
              <TextInput
                style={styles.input}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#999"
                editable={!loading}
              />
            </ThemedView>

            <ThemedView style={styles.inputGroup}>
              <ThemedText style={styles.label}>
                Observações (opcional)
              </ThemedText>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Adicione observações..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                editable={!loading}
              />
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
    padding: 20,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#dee2e6",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#333",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  typeContainer: {
    flexDirection: "row",
    gap: 10,
  },
  typeButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#dee2e6",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  incomeButton: {
    borderColor: "#28a745",
    backgroundColor: "#e8f5e8",
  },
  expenseButton: {
    borderColor: "#dc3545",
    backgroundColor: "#ffeaea",
  },
  typeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  activeTypeText: {
    color: "#333",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#dee2e6",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 15,
    marginTop: 30,
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
  disabledButton: {
    backgroundColor: "#6c757d",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
});

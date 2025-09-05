import { CategoryPicker } from "@/components/CategoryPicker";
import { DatePicker } from "@/components/DatePicker";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useCategories } from "@/contexts/CategoryContext";
import { useTransfers } from "@/contexts/TransferContext";
import { TransactionType, Transfer } from "@/types";
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
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!description.trim()) {
      newErrors.description = "Campo obrigatório";
    }

    if (!amount || parseFloat(amount.replace(/\D/g, "")) <= 0) {
      newErrors.amount = "Valor inválido";
    }

    if (!categoryId) {
      newErrors.categoryId = "Selecione uma categoria";
    }

    if (!date) {
      newErrors.date = "Selecione uma data";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePriceChange = (text: string) => {
    const formatted = formatPrice(text);
    setAmount(formatted);

    if (errors.amount) {
      setErrors((prev) => ({ ...prev, amount: "" }));
    }
  };

  const formatPrice = (text: string) => {
    const numericValue = text.replace(/\D/g, "");

    if (numericValue === "") return "";

    const value = parseInt(numericValue, 10) / 100;

    return value.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
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

    if (!transfer) return;

    try {
      const numericAmount = parseFloat(
        amount.replace(/\./g, "").replace(",", ".")
      );

      const updatedTransfer: Transfer = {
        ...transfer,
        description: description.trim(),
        amount: numericAmount,
        type,
        categoryId,
        date,
        notes: notes.trim() || undefined,
      };

      await updateTransfer(updatedTransfer);

      Alert.alert("Sucesso", "Transferência atualizada!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert("Erro", "Falha ao atualizar");
    }
  };

  if (!transfer) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#666" />
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

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
              <ThemedText style={styles.label}>Descrição</ThemedText>
              <TextInput
                style={[styles.input, errors.description && styles.inputError]}
                value={description}
                onChangeText={(text) => {
                  setDescription(text);
                  clearFieldError("description");
                }}
                placeholder="Digite a descrição"
                placeholderTextColor="#999"
                editable={!loading}
              />
              {errors.description && (
                <ThemedText style={styles.error}>
                  {errors.description}
                </ThemedText>
              )}
            </ThemedView>

            <ThemedView style={styles.field}>
              <ThemedText style={styles.label}>Valor</ThemedText>
              <ThemedView style={styles.valueContainer}>
                <ThemedText style={styles.currency}>R$</ThemedText>
                <TextInput
                  style={[
                    styles.valueInput,
                    errors.amount && styles.inputError,
                  ]}
                  value={amount}
                  onChangeText={handlePriceChange}
                  placeholder="0,00"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  editable={!loading}
                />
              </ThemedView>
              {errors.amount && (
                <ThemedText style={styles.error}>{errors.amount}</ThemedText>
              )}
            </ThemedView>

            <ThemedView style={styles.field}>
              <ThemedText style={styles.label}>Tipo</ThemedText>
              <ThemedView style={styles.typeRow}>
                <TouchableOpacity
                  style={[
                    styles.typeBtn,
                    type === TransactionType.INCOME && styles.incomeActive,
                  ]}
                  onPress={() => setType(TransactionType.INCOME)}
                  disabled={loading}
                >
                  <ThemedText
                    style={[
                      styles.typeTxt,
                      type === TransactionType.INCOME && styles.typeActiveTxt,
                    ]}
                  >
                    Receita
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeBtn,
                    type === TransactionType.EXPENSE && styles.expenseActive,
                  ]}
                  onPress={() => setType(TransactionType.EXPENSE)}
                  disabled={loading}
                >
                  <ThemedText
                    style={[
                      styles.typeTxt,
                      type === TransactionType.EXPENSE && styles.typeActiveTxt,
                    ]}
                  >
                    Despesa
                  </ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>

            <ThemedView style={styles.field}>
              <ThemedText style={styles.label}>Categoria</ThemedText>
              <ThemedView
                style={[styles.picker, errors.categoryId && styles.inputError]}
              >
                <CategoryPicker
                  categories={categories}
                  selectedCategoryId={categoryId}
                  onCategorySelect={(id) => {
                    setCategoryId(id);
                    clearFieldError("categoryId");
                  }}
                  disabled={loading}
                  placeholder="Selecionar"
                />
              </ThemedView>
              {errors.categoryId && (
                <ThemedText style={styles.error}>
                  {errors.categoryId}
                </ThemedText>
              )}
            </ThemedView>

            <ThemedView style={styles.field}>
              <ThemedText style={styles.label}>Data</ThemedText>
              <DatePicker
                selectedDate={date}
                onDateSelect={(selectedDate) => {
                  setDate(selectedDate);
                  clearFieldError("date");
                }}
                label=""
                placeholder="Selecionar data"
                editable={!loading}
              />
              {errors.date && (
                <ThemedText style={styles.error}>{errors.date}</ThemedText>
              )}
            </ThemedView>

            <ThemedView style={styles.field}>
              <ThemedText style={styles.label}>Observações</ThemedText>
              <TextInput
                style={[styles.input, styles.textarea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Observações (opcional)"
                placeholderTextColor="#999"
                multiline
                numberOfLines={2}
                textAlignVertical="top"
                editable={!loading}
              />
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
    backgroundColor: "#f8f9fa",
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
  valueContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    backgroundColor: "#fff",
    paddingLeft: 10,
  },
  currency: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    marginRight: 4,
  },
  valueInput: {
    flex: 1,
    padding: 10,
    paddingLeft: 0,
    fontSize: 14,
    color: "#333",
  },
  textarea: {
    minHeight: 60,
    textAlignVertical: "top",
  },
  typeRow: {
    flexDirection: "row",
    gap: 8,
  },
  typeBtn: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  incomeActive: {
    borderColor: "#28a745",
    backgroundColor: "#f0f9f0",
  },
  expenseActive: {
    borderColor: "#dc3545",
    backgroundColor: "#fff5f5",
  },
  typeTxt: {
    fontSize: 13,
    fontWeight: "500",
    color: "#666",
  },
  typeActiveTxt: {
    color: "#333",
  },
  picker: {
    borderRadius: 6,
    overflow: "hidden",
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

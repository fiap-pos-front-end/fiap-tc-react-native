import { CategoryPicker } from "@/components/CategoryPicker";
import { DatePicker } from "@/components/DatePicker";
import { SimpleFilePicker } from "@/components/SimpleFilePicker";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useCategories } from "@/contexts/CategoryContext";
import { useTransfers } from "@/contexts/TransferContext";
import { useTransferAttachments } from "@/hooks/firebase/useStorage";
import { TransactionType } from "@/types";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";

export default function AddTransferScreen() {
  const router = useRouter();
  const { addTransfer, loading } = useTransfers();
  const { categories } = useCategories();
  const { uploadAttachment, uploading, progress } = useTransferAttachments();

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

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

    try {
      const transferId = await addTransfer({
        description: description.trim(),
        amount: parseFloat(amount),
        type,
        categoryId,
        date,
        notes: notes.trim() || undefined,
      });

      if (selectedImages.length > 0) {
        for (const imageUri of selectedImages) {
          await uploadAttachment(imageUri, transferId, "image");
        }
      }

      Alert.alert("Sucesso", "Transferência criada com sucesso!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert("Erro", "Falha ao criar transferência");
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
  const handlePriceChange = (text: string) => {
    const formatted = formatPrice(text);
    setAmount(formatted);
  };

  const handleImageSelected = (imageUri: string) => {
    setSelectedImages((prev) => [...prev, imageUri]);
    Alert.alert("Sucesso", "Foto adicionada!");
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const isLoading = loading || uploading;

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
                editable={!isLoading}
              />
            </ThemedView>

            <ThemedView style={styles.inputGroup}>
              <ThemedText style={styles.label}>Valor</ThemedText>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={handlePriceChange}
                placeholder="0,00"
                placeholderTextColor="#999"
                keyboardType="numeric"
                editable={!isLoading}
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
              <DatePicker
                selectedDate={date}
                onDateSelect={setDate}
                label="Data da Transferência"
                placeholder="Selecionar data"
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

            <ThemedView style={styles.inputGroup}>
              <ThemedText style={styles.label}>Anexos</ThemedText>

              <SimpleFilePicker
                onImageSelected={handleImageSelected}
                disabled={isLoading}
              />

              {selectedImages.length > 0 && (
                <ThemedView style={styles.imagesPreview}>
                  <ThemedText style={styles.previewTitle}>
                    {selectedImages.length} foto
                    {selectedImages.length > 1 ? "s" : ""} selecionada
                    {selectedImages.length > 1 ? "s" : ""}
                  </ThemedText>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {selectedImages.map((imageUri, index) => (
                      <ThemedView
                        key={index}
                        style={styles.imagePreviewContainer}
                      >
                        <Image
                          source={{ uri: imageUri }}
                          style={styles.imagePreview}
                        />
                        <TouchableOpacity
                          style={styles.removeImageButton}
                          onPress={() => removeImage(index)}
                        >
                          <ThemedText style={styles.removeImageText}>
                            ❌
                          </ThemedText>
                        </TouchableOpacity>
                      </ThemedView>
                    ))}
                  </ScrollView>
                </ThemedView>
              )}
            </ThemedView>

            {uploading && (
              <ThemedView style={styles.progressContainer}>
                <ThemedText style={styles.progressText}>
                  Enviando anexos... {Math.round(progress)}%
                </ThemedText>
                <ThemedView style={styles.progressBar}>
                  <ThemedView
                    style={[styles.progressFill, { width: `${progress}%` }]}
                  />
                </ThemedView>
              </ThemedView>
            )}
          </ThemedView>

          <ThemedView style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.back()}
              disabled={isLoading}
            >
              <ThemedText style={styles.cancelButtonText}>Cancelar</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, isLoading && styles.disabledButton]}
              onPress={handleSave}
              disabled={isLoading}
            >
              <ThemedText style={styles.saveButtonText}>
                {isLoading ? "Salvando..." : "Salvar"}
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
  imagesPreview: {
    marginTop: 15,
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
  imagePreviewContainer: {
    marginRight: 10,
    position: "relative",
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#fff",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  removeImageText: {
    fontSize: 10,
  },
  progressContainer: {
    marginTop: 15,
    padding: 15,
    backgroundColor: "#f8f9ff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0ff",
  },
  progressText: {
    fontSize: 14,
    color: "#007bff",
    marginBottom: 8,
    textAlign: "center",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#007bff",
    borderRadius: 4,
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
});

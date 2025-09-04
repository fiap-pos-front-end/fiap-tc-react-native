import { AttachmentViewer } from "@/components/AttachmentViewer";
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
  TouchableOpacity,
} from "react-native";

export default function ViewTransferScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getTransferById, deleteTransfer, loading } = useTransfers();
  const { getCategoryById } = useCategories();
  const [transfer, setTransfer] = useState<Transfer | null>(null);

  useEffect(() => {
    if (id) {
      const foundTransfer = getTransferById(id);
      if (foundTransfer) {
        setTransfer(foundTransfer);
      } else {
        Alert.alert("Erro", "Transferência não encontrada", [
          { text: "OK", onPress: () => router.back() },
        ]);
      }
    }
  }, [id, getTransferById]);

  const handleDelete = () => {
    if (!transfer) return;

    Alert.alert(
      "Excluir Transferência",
      `Tem certeza que deseja excluir "${transfer.description}"?\n\nEsta ação não pode ser desfeita.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTransfer(transfer.id);
              Alert.alert("Sucesso", "Transferência excluída!", [
                { text: "OK", onPress: () => router.replace("/transfers") },
              ]);
            } catch (error) {
              Alert.alert("Erro", "Falha ao excluir transferência");
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    if (transfer) {
      router.push(`/transfers/${transfer.id}/edit`);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const getCategory = () => {
    if (!transfer) return null;
    return getCategoryById(transfer.categoryId);
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

  const category = getCategory();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.content}>
          {/* Header */}
          <ThemedView style={styles.header}>
            <ThemedView
              style={[
                styles.typeIndicator,
                transfer.type === TransactionType.INCOME
                  ? styles.incomeIndicator
                  : styles.expenseIndicator,
              ]}
            >
              <ThemedText style={styles.typeIcon}>
                {transfer.type === TransactionType.INCOME ? "💰" : "💸"}
              </ThemedText>
              <ThemedText style={styles.typeText}>
                {transfer.type === TransactionType.INCOME
                  ? "Receita"
                  : "Despesa"}
              </ThemedText>
            </ThemedView>

            <ThemedText style={styles.description}>
              {transfer.description}
            </ThemedText>

            <ThemedText
              style={[
                styles.amount,
                transfer.type === TransactionType.INCOME
                  ? styles.incomeAmount
                  : styles.expenseAmount,
              ]}
            >
              {transfer.type === TransactionType.INCOME ? "+" : "-"}
              {formatCurrency(transfer.amount)}
            </ThemedText>
          </ThemedView>

          {/* Info */}
          <ThemedView style={styles.infoSection}>
            <ThemedText style={styles.sectionTitle}>Informações</ThemedText>

            <ThemedView style={styles.infoCard}>
              <ThemedView style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Categoria:</ThemedText>
                <ThemedView style={styles.categoryInfo}>
                  <ThemedText style={styles.categoryIcon}>
                    {category?.icon || "❓"}
                  </ThemedText>
                  <ThemedText style={styles.infoValue}>
                    {category?.name || "Categoria não encontrada"}
                  </ThemedText>
                </ThemedView>
              </ThemedView>

              <ThemedView style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Data:</ThemedText>
                <ThemedText style={styles.infoValue}>
                  {formatDate(transfer.date)}
                </ThemedText>
              </ThemedView>

              <ThemedView style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Valor:</ThemedText>
                <ThemedText style={styles.infoValue}>
                  {formatCurrency(transfer.amount)}
                </ThemedText>
              </ThemedView>

              <ThemedView style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Tipo:</ThemedText>
                <ThemedText style={styles.infoValue}>
                  {transfer.type === TransactionType.INCOME
                    ? "Receita"
                    : "Despesa"}
                </ThemedText>
              </ThemedView>

              {transfer.notes && (
                <ThemedView style={styles.infoRow}>
                  <ThemedText style={styles.infoLabel}>Observações:</ThemedText>
                  <ThemedText style={styles.infoValue}>
                    {transfer.notes}
                  </ThemedText>
                </ThemedView>
              )}
            </ThemedView>
          </ThemedView>

          <AttachmentViewer transferId={transfer.id} editable={false} />

          {/* Actions */}
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
              <ThemedText style={styles.deleteButtonText}>
                🗑️ Excluir
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
  typeIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 25,
    marginBottom: 20,
  },
  incomeIndicator: {
    backgroundColor: "#e8f5e8",
  },
  expenseIndicator: {
    backgroundColor: "#ffeaea",
  },
  typeIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  typeText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  description: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
    marginBottom: 15,
  },
  amount: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
  },
  incomeAmount: {
    color: "#28a745",
  },
  expenseAmount: {
    color: "#dc3545",
  },
  infoSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    color: "#333",
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
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 8,
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
    fontSize: 16,
    color: "#666",
  },
});

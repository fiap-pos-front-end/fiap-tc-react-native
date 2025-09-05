import { AttachmentViewer } from "@/components/AttachmentViewer";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useCategories } from "@/contexts/CategoryContext";
import { useTransfers } from "@/contexts/TransferContext";
import { TransactionType, Transfer } from "@/types";
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

    Alert.alert("Excluir", `Excluir "${transfer.description}"?`, [
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
            Alert.alert("Erro", "Falha ao excluir");
          }
        },
      },
    ]);
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
        <ThemedView style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>Carregando...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  const category = getCategory();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <ThemedView style={styles.header}>
          <ThemedText style={styles.description}>
            {transfer.description}
          </ThemedText>
          <ThemedText
            style={[
              styles.amount,
              transfer.type === TransactionType.INCOME
                ? styles.income
                : styles.expense,
            ]}
          >
            {transfer.type === TransactionType.INCOME ? "+" : "-"}
            {formatCurrency(transfer.amount)}
          </ThemedText>
          <ThemedText style={styles.type}>
            {transfer.type === TransactionType.INCOME ? "Receita" : "Despesa"}
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.info}>
          <ThemedView style={styles.row}>
            <ThemedText style={styles.label}>Categoria</ThemedText>
            <ThemedView style={styles.categoryRow}>
              <ThemedText style={styles.categoryIcon}>
                {category?.icon || "❓"}
              </ThemedText>
              <ThemedText style={styles.value}>
                {category?.name || "N/A"}
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.row}>
            <ThemedText style={styles.label}>Data</ThemedText>
            <ThemedText style={styles.value}>
              {formatDate(transfer.date)}
            </ThemedText>
          </ThemedView>

          {transfer.notes && (
            <ThemedView style={styles.row}>
              <ThemedText style={styles.label}>Observações</ThemedText>
              <ThemedText style={styles.value}>{transfer.notes}</ThemedText>
            </ThemedView>
          )}
        </ThemedView>

        <AttachmentViewer transferId={transfer.id} editable={false} />

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
    gap: 4,
  },
  description: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  amount: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  income: {
    color: "#28a745",
  },
  expense: {
    color: "#dc3545",
  },
  type: {
    fontSize: 12,
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: 0.5,
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
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
    gap: 4,
  },
  categoryIcon: {
    fontSize: 14,
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

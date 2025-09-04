import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useCategories } from "@/contexts/CategoryContext";
import { useTransfers } from "@/contexts/TransferContext";
import { TransactionType, Transfer } from "@/types";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

export default function TransfersListScreen() {
  const router = useRouter();
  const { transfers, loading, error, deleteTransfer, refreshTransfers } =
    useTransfers();
  const { categories } = useCategories();

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Categoria não encontrada";
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.icon : "❓";
  };

  const handleDeleteTransfer = (transfer: Transfer) => {
    Alert.alert(
      "Excluir Transferência",
      `Deseja realmente excluir "${transfer.description}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTransfer(transfer.id);
              Alert.alert("Sucesso", "Transferência excluída!");
            } catch {
              Alert.alert("Erro", "Falha ao excluir transferência");
            }
          },
        },
      ]
    );
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

  const renderTransfer = ({ item }: { item: Transfer }) => (
    <TouchableOpacity
      style={styles.transferItem}
      onPress={() => router.push(`/transfers/${item.id}/view`)}
    >
      <ThemedView style={styles.transferContent}>
        <ThemedText style={styles.transferIcon}>
          {getCategoryIcon(item.categoryId)}
        </ThemedText>

        <ThemedView style={styles.transferInfo}>
          <ThemedText style={styles.transferDescription}>
            {item.description}
          </ThemedText>
          <ThemedText style={styles.transferCategory}>
            {getCategoryName(item.categoryId)}
          </ThemedText>
          <ThemedText style={styles.transferDate}>
            {formatDate(item.date)}
          </ThemedText>
          {item.notes && (
            <ThemedText style={styles.transferNotes}>{item.notes}</ThemedText>
          )}
        </ThemedView>

        <ThemedView style={styles.transferAmount}>
          <ThemedText
            style={[
              styles.amount,
              item.type === TransactionType.INCOME
                ? styles.incomeAmount
                : styles.expenseAmount,
            ]}
          >
            {item.type === TransactionType.INCOME ? "+" : "-"}
            {formatCurrency(item.amount)}
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.transferActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              handleDeleteTransfer(item);
            }}
          >
            <ThemedText style={styles.actionText}>🗑️</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <ThemedText style={styles.loadingText}>
            Carregando transferências...
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.container}>
          <ThemedText style={styles.errorText}>Erro: {error}</ThemedText>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={refreshTransfers}
          >
            <ThemedText style={styles.retryButtonText}>
              Tentar Novamente
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.container}>
        {transfers.length === 0 ? (
          <ThemedView style={styles.emptyContainer}>
            <ThemedText style={styles.emptyIcon}>📊</ThemedText>
            <ThemedText style={styles.emptyTitle}>
              Nenhuma transferência
            </ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              Comece adicionando sua primeira transação
            </ThemedText>
          </ThemedView>
        ) : (
          <FlatList
            data={transfers}
            renderItem={renderTransfer}
            keyExtractor={(item) => item.id}
            style={styles.list}
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={refreshTransfers}
                colors={["#007bff"]}
              />
            }
            contentContainerStyle={styles.listContent}
          />
        )}
      </ThemedView>
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
  list: {
    flex: 1,
    marginTop: 15,
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 100,
  },
  transferItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transferContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  transferIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  transferInfo: {
    flex: 1,
  },
  transferDescription: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  transferCategory: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  transferDate: {
    fontSize: 12,
    color: "#999",
  },
  transferNotes: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
    marginTop: 4,
  },
  transferActions: {
    flexDirection: "row",
    gap: 8,
    marginLeft: 10,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  actionText: {
    fontSize: 14,
  },
  transferAmount: {
    alignItems: "flex-end",
  },
  amount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  incomeAmount: {
    color: "#28a745",
  },
  expenseAmount: {
    color: "#dc3545",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    lineHeight: 22,
  },
  loadingText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    color: "#dc3545",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  retryButton: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
    alignSelf: "center",
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

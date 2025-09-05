import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useCategories } from "@/contexts/CategoryContext";
import { useTransfers } from "@/contexts/TransferContext";
import { TransactionType, Transfer } from "@/types";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
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

  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setRefreshKey((prev) => prev + 1);
  }, [transfers.length, loading, error]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);

    try {
      if (refreshTransfers) {
        await refreshTransfers();
      }

      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error("Erro ao atualizar transfers:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshTransfers]);

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

              setRefreshKey((prev) => prev + 1);
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

  const renderTransfer = useCallback(
    ({ item }: { item: Transfer }) => (
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
    ),
    [router, categories, handleDeleteTransfer, getCategoryIcon, getCategoryName]
  );

  if (loading && !isRefreshing) {
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
        <ThemedView style={styles.centeredContainer}>
          <ThemedText style={styles.errorText}>Erro: {error}</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
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
      <ThemedView style={styles.container} key={refreshKey}>
        {transfers.length === 0 ? (
          <ThemedView style={styles.emptyContainer}>
            <ThemedText style={styles.emptyIcon}>📊</ThemedText>
            <ThemedText style={styles.emptyTitle}>
              Nenhuma transferência
            </ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              Comece adicionando sua primeira transação
            </ThemedText>
            <ThemedText style={styles.pullToRefreshHint}>
              Puxe para baixo para atualizar
            </ThemedText>
          </ThemedView>
        ) : (
          <FlatList
            data={transfers}
            renderItem={renderTransfer}
            keyExtractor={(item) => `${item.id}-${refreshKey}`}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            extraData={refreshKey}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                colors={["#007bff"]}
                tintColor="#007bff"
                title="Atualizando transferências..."
                titleColor="#666"
              />
            }
            removeClippedSubviews={false}
            initialNumToRender={15}
            maxToRenderPerBatch={10}
            windowSize={10}
            getItemLayout={(data, index) => ({
              length: 120,
              offset: 120 * index,
              index,
            })}
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
    marginBottom: 10,
  },
  pullToRefreshHint: {
    fontSize: 14,
    textAlign: "center",
    color: "#999",
    fontStyle: "italic",
  },
  loadingText: {
    textAlign: "center",
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    color: "#dc3545",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    alignSelf: "center",
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

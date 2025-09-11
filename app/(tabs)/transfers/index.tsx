import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useCategories } from "@/contexts/CategoryContext";
import { useTransfers } from "@/contexts/TransferContext";
import { TransactionType, Transfer } from "@/types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

export default function TransfersListScreen() {
  const router = useRouter();
  const {
    transfers,
    loading,
    error,
    deleteTransfer,
    refreshTransfers,
    hasNext,
    loadMore,
    loadingMore,
  } = useTransfers();
  const { categories } = useCategories();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Transfer | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshTransfers();
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshTransfers]);

  const getCategoryName = useCallback(
    (categoryId: string) =>
      categories.find((c) => c.id === categoryId)?.name ?? "N/A",
    [categories]
  );

  const getCategoryIcon = useCallback(
    (categoryId: string) =>
      categories.find((c) => c.id === categoryId)?.icon ?? "❓",
    [categories]
  );

  const openActionModal = (item: Transfer) => {
    setSelectedItem(item);
    setShowActionModal(true);
  };

  const closeActionModal = () => {
    setShowActionModal(false);
    setSelectedItem(null);
  };

  const handleView = () => {
    if (!selectedItem) return;
    closeActionModal();
    router.push(`/transfers/${selectedItem.id}/view`);
  };

  const handleEdit = () => {
    if (!selectedItem) return;
    closeActionModal();
    router.push(`/transfers/${selectedItem.id}/edit`);
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    Alert.alert("Excluir", `Excluir "${selectedItem.description}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteTransfer(selectedItem.id);
            closeActionModal();
          } catch {
            Alert.alert("Erro", "Falha ao excluir");
          }
        },
      },
    ]);
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });

  const keyExtractor = useCallback((item: Transfer) => item.id, []);
  const renderTransfer = useCallback(
    ({ item }: { item: Transfer }) => (
      <TouchableOpacity
        style={styles.item}
        onPress={() => router.push(`/transfers/${item.id}/view`)}
        onLongPress={() => openActionModal(item)}
        delayLongPress={500}
      >
        <ThemedView style={styles.content}>
          <ThemedText style={styles.icon}>
            {getCategoryIcon(item.categoryId)}
          </ThemedText>

          <ThemedView style={styles.info}>
            <ThemedText style={styles.description}>
              {item.description}
            </ThemedText>
            <ThemedText style={styles.category}>
              {getCategoryName(item.categoryId)} • {formatDate(item.date)}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.right}>
            <ThemedText
              style={[
                styles.amount,
                item.type === TransactionType.INCOME
                  ? styles.income
                  : styles.expense,
              ]}
            >
              {item.type === TransactionType.INCOME ? "+" : ""}
              {formatCurrency(item.amount)}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </TouchableOpacity>
    ),
    [router, getCategoryIcon, getCategoryName]
  );

  const ListEmptyComponent = useMemo(
    () => (
      <ThemedView style={styles.emptyContainer}>
        <MaterialCommunityIcons name="bank-transfer" size={48} color="#ccc" />
        <ThemedText style={styles.emptyTitle}>Nenhuma transferência</ThemedText>
        <ThemedText style={styles.emptySubtitle}>
          Adicione sua primeira transação
        </ThemedText>
      </ThemedView>
    ),
    []
  );

  const ListFooterComponent = useMemo(
    () =>
      loadingMore ? (
        <View style={styles.footer}>
          <ActivityIndicator size="small" color="#666" />
        </View>
      ) : null,
    [loadingMore]
  );

  if (loading && !isRefreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#666" />
          <ThemedText style={styles.loadingText}>Carregando...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.loadingContainer}>
          <ThemedText style={styles.errorText}>Erro: {error}</ThemedText>
          <TouchableOpacity style={styles.retryBtn} onPress={onRefresh}>
            <ThemedText style={styles.retryText}>Tentar Novamente</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.container}>
        <FlatList
          data={transfers}
          renderItem={renderTransfer}
          keyExtractor={keyExtractor}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={ListEmptyComponent}
          ListFooterComponent={ListFooterComponent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={["#666"]}
              tintColor="#666"
            />
          }
          removeClippedSubviews={false}
          initialNumToRender={15}
          maxToRenderPerBatch={10}
          windowSize={10}
          getItemLayout={(data, index) => ({
            length: 70,
            offset: 70 * index,
            index,
          })}
          onEndReachedThreshold={0.35}
          onEndReached={() => {
            if (hasNext && !loadingMore) loadMore?.();
          }}
        />
      </ThemedView>

      <Modal
        visible={showActionModal}
        transparent
        animationType="fade"
        onRequestClose={closeActionModal}
      >
        <Pressable style={styles.modalOverlay} onPress={closeActionModal}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>
              {selectedItem?.description}
            </ThemedText>

            <TouchableOpacity style={styles.actionItem} onPress={handleView}>
              <MaterialCommunityIcons
                name="eye-outline"
                size={20}
                color="#333"
              />
              <ThemedText style={styles.actionText}>Ver detalhes</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={handleEdit}>
              <MaterialCommunityIcons
                name="pencil-outline"
                size={20}
                color="#333"
              />
              <ThemedText style={styles.actionText}>Editar</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionItem, styles.actionDanger]}
              onPress={handleDelete}
            >
              <MaterialCommunityIcons
                name="trash-can-outline"
                size={20}
                color="#dc3545"
              />
              <ThemedText style={[styles.actionText, styles.actionDangerText]}>
                Excluir
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={closeActionModal}
            >
              <ThemedText style={styles.cancelText}>Cancelar</ThemedText>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  loadingText: { fontSize: 13, color: "#666" },
  errorText: { color: "#dc3545", fontSize: 13, textAlign: "center" },
  retryBtn: {
    backgroundColor: "#007bff",
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  retryText: { color: "white", fontSize: 12, fontWeight: "500" },
  list: { flex: 1 },
  listContent: { padding: 16, paddingBottom: 80 },
  footer: { paddingVertical: 16 },
  item: {
    backgroundColor: "#fff",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  content: { flexDirection: "row", alignItems: "center", gap: 12 },
  icon: { fontSize: 16 },
  info: { flex: 1, gap: 2 },
  description: { fontSize: 14, fontWeight: "500", color: "#333" },
  category: { fontSize: 11, color: "#666" },
  right: { alignItems: "flex-end" },
  amount: { fontSize: 13, fontWeight: "600" },
  income: { color: "#28a745" },
  expense: { color: "#dc3545" },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    padding: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
  },
  emptySubtitle: { fontSize: 13, color: "#666", textAlign: "center" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 15,
    paddingHorizontal: 5,
    borderRadius: 8,
  },
  actionText: { fontSize: 14, color: "#333", fontWeight: "500" },
  actionDanger: { backgroundColor: "#fff5f5" },
  actionDangerText: { color: "#dc3545" },
  cancelButton: {
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  cancelText: { fontSize: 14, color: "#666", fontWeight: "500" },
});

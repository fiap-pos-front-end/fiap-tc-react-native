import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { DatePicker } from "@/components/DatePicker";
import { useCategories } from "@/contexts/CategoryContext";
import { useTransfers, TransferProvider } from "@/contexts/TransferContext";
import { TransactionType, Transfer } from "@/types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

function TransfersListInner({
  categoryId,
  type,
  search,
  dateRange,
}: {
  categoryId: string | null;
  type: TransactionType | null;
  search: string;
  dateRange: { start?: string; end?: string };
}) {
  const router = useRouter();
  const { categories } = useCategories();

  const {
    transfers,
    deleteTransfer,
    refreshTransfers,
    hasNext,
    loadMore,
    loadingMore,
  } = useTransfers();

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
    (id: string) => categories.find((c) => c.id === id)?.name ?? "N/A",
    [categories]
  );
  const getCategoryIcon = useCallback(
    (id: string) => categories.find((c) => c.id === id)?.icon ?? "❓",
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

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(v);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

  const renderTransfer = useCallback(
    ({ item }: { item: Transfer }) => (
      <TouchableOpacity
        style={styles.item}
        onPress={() => router.push(`/transfers/${item.id}/view`)}
        onLongPress={() => openActionModal(item)}
      >
        <ThemedView style={styles.content}>
          <ThemedText style={styles.icon}>{getCategoryIcon(item.categoryId)}</ThemedText>
          <ThemedView style={styles.info}>
            <ThemedText style={styles.description}>{item.description}</ThemedText>
            <ThemedText style={styles.category}>
              {getCategoryName(item.categoryId)} • {formatDate(item.date)}
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.right}>
            <ThemedText
              style={[
                styles.amount,
                item.type === TransactionType.INCOME ? styles.income : styles.expense,
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

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={transfers}
        renderItem={renderTransfer}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={["#666"]} />
        }
        onEndReachedThreshold={0.35}
        onEndReached={() => hasNext && !loadingMore && loadMore?.()}
        ListFooterComponent={loadingMore ? <ActivityIndicator style={{ margin: 16 }} /> : null}
      />

      <Modal visible={showActionModal} transparent animationType="fade" onRequestClose={closeActionModal}>
        <Pressable style={styles.modalOverlay} onPress={closeActionModal}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>{selectedItem?.description}</ThemedText>
            <TouchableOpacity style={styles.actionItem} onPress={handleDelete}>
              <MaterialCommunityIcons name="trash-can-outline" size={20} color="#dc3545" />
              <ThemedText style={{ color: "#dc3545" }}>Excluir</ThemedText>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

export default function TransfersListScreen() {
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [type, setType] = useState<TransactionType | null>(null);
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<{ start?: string; end?: string }>({});

  return (
    <>
      <View style={styles.filters}>
        <TextInput
          style={styles.input}
          placeholder="Buscar descrição..."
          value={search}
          onChangeText={setSearch}
        />

        <TouchableOpacity
          style={[styles.filterBtn, type === TransactionType.INCOME && styles.incomeFilter]}
          onPress={() => setType(type === TransactionType.INCOME ? null : TransactionType.INCOME)}
        >
          <ThemedText style={type === TransactionType.INCOME ? styles.incomeFilterText : undefined}>
            Receitas
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, type === TransactionType.EXPENSE && styles.expenseFilter]}
          onPress={() => setType(type === TransactionType.EXPENSE ? null : TransactionType.EXPENSE)}
        >
          <ThemedText style={type === TransactionType.EXPENSE ? styles.expenseFilterText : undefined}>
            Despesas
          </ThemedText>
        </TouchableOpacity>
      </View>

      <TransferProvider
        filters={{
          categoryId: categoryId ?? undefined,
          type: type ?? undefined,
          search: search || undefined,
          startDate: dateRange.start,
          endDate: dateRange.end,
        }}
      >
        <TransfersListInner
          categoryId={categoryId}
          type={type}
          search={search}
          dateRange={dateRange}
        />
      </TransferProvider>
    </>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff" },
  listContent: { 
    padding: 16,
    paddingBottom: 80 },
  item: {
    backgroundColor: "#fff",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  content: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 12 
  },
  icon: { 
    fontSize: 16 
  },
  info: { 
    flex: 1, 
    gap: 2 
  },
  description: { 
    fontSize: 14, 
    fontWeight: "500", 
    color: "#333" 
  },
  category: { 
    fontSize: 11, 
    color: "#666" 
  },
  right: { 
    alignItems: "flex-end" 
  },
  amount: { 
    fontSize: 13, fontWeight: "600" 
  },
  income: {
    color: "#28a745" 
  },
  expense: { 
    color: "#dc3545" 
  },
  filters: {
    flexDirection: "row",
    padding: 8,
    gap: 8,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
     backgroundColor: "#fff",
    padding: 6,
    fontSize: 13,
  },
  filterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  incomeFilter: { 
    backgroundColor: "#e6f9ed",
    borderColor: "#28a745" 
  },
  incomeFilterText: { 
    color: "#28a745", 
    fontWeight: "600" 
  },
  expenseFilter: { 
    backgroundColor: "#fdecea", 
    borderColor: "#dc3545" 
  },
  expenseFilterText: { 
    color: "#dc3545", 
    fontWeight: "600" 
  },
  modalOverlay: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "rgba(0,0,0,0.4)"
  },
  modalContent: { 
    backgroundColor: "#fff", 
    padding: 20, 
    borderRadius: 12, 
    width: "80%" 
  },
  modalTitle: { 
    fontSize: 16, 
    fontWeight: "600", 
    marginBottom: 10, 
    textAlign: "center"
   },
  actionItem: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 10, 
    padding: 10 
  },
});

import { DatePicker } from "@/components/DatePicker";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useCategories } from "@/contexts/CategoryContext";
import { TransferProvider, useTransfers } from "@/contexts/TransferContext";
import { TransactionType, Transfer } from "@/types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    v
  );
const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });

function TransfersListInner() {
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

  const categoriesMap = useMemo(() => {
    const map = new Map<string, { name: string; icon?: string }>();
    for (const c of categories) map.set(c.id, { name: c.name, icon: c.icon });
    return map;
  }, [categories]);

  const getCategoryName = useCallback(
    (id: string) => categoriesMap.get(id)?.name ?? "N/A",
    [categoriesMap]
  );
  const getCategoryIcon = useCallback(
    (id: string) => categoriesMap.get(id)?.icon ?? "❓",
    [categoriesMap]
  );

  const refreshRef = useRef(refreshTransfers);
  useEffect(() => {
    refreshRef.current = refreshTransfers;
  }, [refreshTransfers]);

  const didMountRef = useRef(false);
  useEffect(() => {
    if (didMountRef.current) return;
    didMountRef.current = true;
    (async () => {
      try {
        await refreshRef.current();
      } catch {}
    })();
  }, []);

  const lastFocusRefresh = useRef(0);
  useFocusEffect(
    useCallback(() => {
      const now = Date.now();
      if (now - lastFocusRefresh.current < 300) return;
      lastFocusRefresh.current = now;
      let active = true;
      (async () => {
        try {
          if (active) await refreshRef.current();
        } catch {}
      })();
      return () => {
        active = false;
      };
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshRef.current();
    } finally {
      setIsRefreshing(false);
    }
  }, []);

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
            await refreshRef.current();
            closeActionModal();
          } catch {
            Alert.alert("Erro", "Falha ao excluir");
          }
        },
      },
    ]);
  };

  const renderTransfer = useCallback(
    ({ item }: { item: Transfer }) => (
      <TouchableOpacity
        style={styles.item}
        onPress={() => router.push(`/transfers/${item.id}/view`)}
        onLongPress={() => openActionModal(item)}
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

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={transfers}
        renderItem={renderTransfer}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={["#666"]}
          />
        }
        onEndReachedThreshold={0.35}
        onEndReached={() => hasNext && !loadingMore && loadMore?.()}
        ListFooterComponent={
          loadingMore ? <ActivityIndicator style={{ margin: 16 }} /> : null
        }
      />

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
            <TouchableOpacity style={styles.actionItem} onPress={handleDelete}>
              <MaterialCommunityIcons
                name="trash-can-outline"
                size={20}
                color="#dc3545"
              />
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
  const [date, setDate] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const { categories, loading: loadingCat } = useCategories();

  const filters = useMemo(
    () => ({
      categoryId: categoryId ?? undefined,
      type: type ?? undefined,
      search: search || undefined,
      startDate: date || undefined,
      endDate: date || undefined,
    }),
    [categoryId, type, search, date]
  );

  return (
    <>
      <View style={styles.filters}>
        <TextInput
          style={styles.input}
          placeholder="Buscar descrição..."
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
          autoComplete="off"
          keyboardType="default"
          spellCheck={false}
        />
        <TouchableOpacity
          style={styles.filterIcon}
          onPress={() => setShowFilters(true)}
        >
          <MaterialCommunityIcons
            name="filter-variant"
            size={22}
            color="#333"
          />
        </TouchableOpacity>
      </View>

      <Modal
        visible={showFilters}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowFilters(false)}
        >
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>Filtros</ThemedText>

            <View style={styles.row}>
              <TouchableOpacity
                style={[
                  styles.filterBtn,
                  type === TransactionType.INCOME && styles.incomeFilter,
                ]}
                onPress={() =>
                  setType(
                    type === TransactionType.INCOME
                      ? null
                      : TransactionType.INCOME
                  )
                }
              >
                <ThemedText
                  style={
                    type === TransactionType.INCOME
                      ? styles.incomeFilterText
                      : undefined
                  }
                >
                  Receitas
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.filterBtn,
                  type === TransactionType.EXPENSE && styles.expenseFilter,
                ]}
                onPress={() =>
                  setType(
                    type === TransactionType.EXPENSE
                      ? null
                      : TransactionType.EXPENSE
                  )
                }
              >
                <ThemedText
                  style={
                    type === TransactionType.EXPENSE
                      ? styles.expenseFilterText
                      : undefined
                  }
                >
                  Despesas
                </ThemedText>
              </TouchableOpacity>
            </View>

            {!loadingCat && (
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={categoryId ?? "all"}
                  onValueChange={(value) =>
                    setCategoryId(value === "all" ? null : value)
                  }
                >
                  <Picker.Item label="Todas as categorias" value="all" />
                  {categories.map((cat) => (
                    <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
                  ))}
                </Picker>
              </View>
            )}

            <ThemedView style={styles.field}>
              <DatePicker
                selectedDate={date}
                onDateSelect={(selectedDate: string) => setDate(selectedDate)}
                placeholder="Selecionar data"
                label=""
              />
            </ThemedView>

            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.clearBtn]}
                onPress={() => {
                  setCategoryId(null);
                  setType(null);
                  setSearch("");
                  setDate("");
                }}
              >
                <ThemedText style={styles.clearBtnText}>
                  Limpar filtros
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.closeBtn]}
                onPress={() => setShowFilters(false)}
              >
                <ThemedText style={styles.closeBtnText}>Fechar</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>

      <TransferProvider filters={filters}>
        <TransfersListInner />
      </TransferProvider>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  listContent: { padding: 16, paddingBottom: 80 },
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
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
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
  filterIcon: {
    padding: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#f9f9f9",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalTitle: { fontSize: 16, fontWeight: "600", marginBottom: 12 },
  row: { flexDirection: "row", gap: 8, marginBottom: 12 },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginBottom: 12,
  },
  field: { marginBottom: 12 },
  filterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  incomeFilter: { backgroundColor: "#e6f9ed", borderColor: "#28a745" },
  incomeFilterText: { color: "#28a745", fontWeight: "600" },
  expenseFilter: { backgroundColor: "#fdecea", borderColor: "#dc3545" },
  expenseFilterText: { color: "#dc3545", fontWeight: "600" },
  closeBtn: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    backgroundColor: "#007bff",
  },
  closeBtnText: { color: "#fff", fontWeight: "600" },
  actionBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 6,
  },
  clearBtn: {
    marginTop: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#f8f9fa",
  },
  clearBtnText: { color: "#333", fontWeight: "600" },
});

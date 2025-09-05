import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useCategories } from "@/contexts/CategoryContext";
import { Category } from "@/types";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
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
import { useAuth } from "../../../hooks/firebase/useAuth";
import { useForceReset } from "../../../hooks/useForceReset";

export default function CategoriesListScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { categories, loading, error, deleteCategory } = useCategories();
  const { forceCompleteReset } = useForceReset();

  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Category | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);

  useEffect(() => {
    setRefreshKey((prev) => prev + 1);
  }, [categories?.length, loading, error]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);

    try {
      await forceCompleteReset();
      setRefreshKey((prev) => prev + 1);
      await new Promise((resolve) => setTimeout(resolve, 1500));
    } catch (error) {
      console.error("Erro no refresh:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [forceCompleteReset]);

  const openActionModal = (item: Category) => {
    setSelectedItem(item);
    setShowActionModal(true);
  };

  const closeActionModal = () => {
    setShowActionModal(false);
    setSelectedItem(null);
  };

  const handleView = () => {
    if (selectedItem) {
      closeActionModal();
      router.push(`/categories/${selectedItem.id}/view`);
    }
  };

  const handleEdit = () => {
    if (selectedItem) {
      closeActionModal();
      router.push(`/categories/${selectedItem.id}/edit`);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;

    Alert.alert("Excluir", `Excluir "${selectedItem.name}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteCategory(selectedItem.id);
            closeActionModal();
            setRefreshKey((prev) => prev + 1);
          } catch {
            Alert.alert("Erro", "Falha ao excluir categoria");
          }
        },
      },
    ]);
  };

  const renderCategory = useCallback(
    ({ item }: { item: Category }) => (
      <TouchableOpacity
        style={styles.item}
        onPress={() => router.push(`/categories/${item.id}/view`)}
        onLongPress={() => openActionModal(item)}
        delayLongPress={500}
      >
        <ThemedView style={styles.content}>
          <ThemedText style={styles.icon}>{item.icon}</ThemedText>

          <ThemedView style={styles.info}>
            <ThemedText style={styles.name}>{item.name}</ThemedText>
          </ThemedView>
        </ThemedView>
      </TouchableOpacity>
    ),
    [router]
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
      <ThemedView style={styles.container} key={refreshKey}>
        {!categories || categories?.length === 0 ? (
          <ThemedView style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="folder-outline"
              size={48}
              color="#ccc"
            />
            <ThemedText style={styles.emptyTitle}>Nenhuma categoria</ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              Adicione sua primeira categoria
            </ThemedText>
          </ThemedView>
        ) : (
          <FlatList
            data={categories}
            renderItem={renderCategory}
            keyExtractor={(item) => `${item.id}-${refreshKey}`}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            extraData={refreshKey}
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
          />
        )}
      </ThemedView>

      <Modal
        visible={showActionModal}
        transparent={true}
        animationType="fade"
        onRequestClose={closeActionModal}
      >
        <Pressable style={styles.modalOverlay} onPress={closeActionModal}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>
              {selectedItem?.name}
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
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: "#666",
  },
  errorText: {
    color: "#dc3545",
    fontSize: 13,
    textAlign: "center",
  },
  retryBtn: {
    backgroundColor: "#007bff",
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  retryText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  item: {
    backgroundColor: "#fff",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  icon: {
    fontSize: 16,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
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
  emptySubtitle: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
  },
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
  actionText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  actionDanger: {
    backgroundColor: "#fff5f5",
  },
  actionDangerText: {
    color: "#dc3545",
  },
  cancelButton: {
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  cancelText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
});

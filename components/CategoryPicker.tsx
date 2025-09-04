import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Category } from "@/types";
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

interface CategoryPickerProps {
  categories: Category[];
  selectedCategoryId: string;
  onCategorySelect: (categoryId: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function CategoryPicker({
  categories,
  selectedCategoryId,
  onCategorySelect,
  disabled = false,
  placeholder = "Selecione uma categoria",
}: CategoryPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedCategory = categories.find(
    (cat) => cat.id === selectedCategoryId
  );

  const handleCategorySelect = (categoryId: string) => {
    onCategorySelect(categoryId);
    setModalVisible(false);
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryOption,
        selectedCategoryId === item.id && styles.selectedCategoryOption,
      ]}
      onPress={() => handleCategorySelect(item.id)}
    >
      <ThemedText style={styles.categoryIcon}>{item.icon}</ThemedText>
      <ThemedText style={styles.categoryName}>{item.name}</ThemedText>
      {selectedCategoryId === item.id && (
        <ThemedText style={styles.checkIcon}>✓</ThemedText>
      )}
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity
        style={[styles.pickerButton, disabled && styles.disabled]}
        onPress={() => setModalVisible(true)}
        disabled={disabled}
      >
        <ThemedView style={styles.pickerContent}>
          {selectedCategory ? (
            <>
              <ThemedText style={styles.selectedIcon}>
                {selectedCategory.icon}
              </ThemedText>
              <ThemedText style={styles.selectedText}>
                {selectedCategory.name}
              </ThemedText>
            </>
          ) : (
            <ThemedText style={styles.placeholderText}>
              {placeholder}
            </ThemedText>
          )}
        </ThemedView>
        <ThemedText style={styles.dropdownIcon}>▼</ThemedText>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <ThemedView style={styles.modalContent}>
            <ThemedView style={styles.modalHeader}>
              <ThemedText type="subtitle">Selecionar Categoria</ThemedText>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <ThemedText style={styles.closeButton}>✕</ThemedText>
              </TouchableOpacity>
            </ThemedView>

            <FlatList
              data={categories}
              renderItem={renderCategory}
              keyExtractor={(item) => item.id}
              style={styles.categoriesList}
              showsVerticalScrollIndicator={false}
            />
          </ThemedView>
        </Pressable>
      </Modal>
    </>
  );
}
const styles = StyleSheet.create({
  pickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#dee2e6",
    borderRadius: 8,
    padding: 15,
    backgroundColor: "#fff",
  },
  disabled: {
    backgroundColor: "#f5f5f5",
    opacity: 0.6,
  },
  pickerContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  selectedIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  selectedText: {
    fontSize: 16,
    color: "#333",
  },
  placeholderText: {
    fontSize: 16,
    color: "#999",
  },
  dropdownIcon: {
    fontSize: 12,
    color: "#666",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  closeButton: {
    fontSize: 18,
    color: "#666",
    fontWeight: "bold",
  },
  categoriesList: {
    maxHeight: 400,
  },
  categoryOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  selectedCategoryOption: {
    backgroundColor: "#f0f8ff",
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  categoryName: {
    fontSize: 16,
    flex: 1,
  },
  checkIcon: {
    fontSize: 16,
    color: "#007bff",
    fontWeight: "bold",
  },
});

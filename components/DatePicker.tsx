import React, { useState } from "react";
import { Modal, StyleSheet, TouchableOpacity } from "react-native";
import { Calendar } from "react-native-calendars";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

interface DatePickerProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  label?: string;
  placeholder?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  selectedDate,
  onDateSelect,
  label = "Data",
  placeholder = "Selecionar data",
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const openDatePicker = () => setModalVisible(true);
  const closeDatePicker = () => setModalVisible(false);

  const handleDateSelect = (day: any) => {
    const dateString = day.dateString;

    const [year, month, dayNum] = dateString.split("-").map(Number);
    const localDate = new Date(year, month - 1, dayNum);
    const localDateString = `${localDate.getFullYear()}-${String(
      localDate.getMonth() + 1
    ).padStart(2, "0")}-${String(localDate.getDate()).padStart(2, "0")}`;

    onDateSelect(localDateString);
    closeDatePicker();
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return "";

    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const ensureLocalDate = (dateString: string) => {
    if (!dateString) return "";

    const [year, month, day] = dateString.split("-").map(Number);
    const localDate = new Date(year, month - 1, day);

    return `${localDate.getFullYear()}-${String(
      localDate.getMonth() + 1
    ).padStart(2, "0")}-${String(localDate.getDate()).padStart(2, "0")}`;
  };

  const getTodayString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const today = getTodayString();

  return (
    <>
      <ThemedView style={styles.container}>
        <ThemedText type="defaultSemiBold">{label}</ThemedText>

        <TouchableOpacity style={styles.dateButton} onPress={openDatePicker}>
          <ThemedText style={styles.dateText}>
            {selectedDate ? formatDisplayDate(selectedDate) : placeholder}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeDatePicker}
      >
        <ThemedView style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <ThemedView style={styles.modalHeader}>
              <ThemedText type="title">Selecionar Data</ThemedText>
              <TouchableOpacity onPress={closeDatePicker}>
                <ThemedText style={styles.closeButton}>✕</ThemedText>
              </TouchableOpacity>
            </ThemedView>

            <Calendar
              current={today}
              onDayPress={handleDateSelect}
              markedDates={{
                [ensureLocalDate(selectedDate)]: {
                  selected: true,
                  selectedColor: "#007bff",
                },
                [today]: {
                  today: true,
                  textColor: "#007bff",
                },
              }}
              theme={{
                todayTextColor: "#007bff",
                selectedDayBackgroundColor: "#007bff",
                selectedDayTextColor: "#ffffff",
                arrowColor: "#007bff",
                monthTextColor: "#2d3748",
                indicatorColor: "#007bff",
                textDayFontSize: 16,
                textMonthFontSize: 18,
                textDayHeaderFontSize: 14,
                todayBackgroundColor: "transparent",
              }}
            />

            <TouchableOpacity
              style={styles.todayButton}
              onPress={() => handleDateSelect({ dateString: today })}
            >
              <ThemedText style={styles.todayButtonText}>Hoje</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: "#dee2e6",
    borderRadius: 8,
    padding: 15,
    backgroundColor: "white",
    alignItems: "center",
    minHeight: 50,
    justifyContent: "center",
  },
  dateText: {
    fontSize: 16,
    color: "#2d3748",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#dee2e6",
  },
  closeButton: {
    fontSize: 24,
    color: "#6c757d",
    padding: 5,
  },
  todayButton: {
    backgroundColor: "#007bff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
  },
  todayButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

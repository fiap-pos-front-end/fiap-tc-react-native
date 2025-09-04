import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useDashboard } from "@/contexts/DashboardContext";

export default function DashboardScreen() {
  const router = useRouter();
  const { dashboardData, loading, error } = useDashboard();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <ThemedText style={styles.loadingText}>
            Carregando dashboard...
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
        </ThemedView>
      </SafeAreaView>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedView style={styles.header}>
          <ThemedText style={styles.title}>Dashboard</ThemedText>
          <ThemedText style={styles.subtitle}>
            Visão geral das suas finanças
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.cardsContainer}>
          <ThemedView style={styles.card}>
            <ThemedText style={styles.cardLabel}>Saldo Atual</ThemedText>
            <ThemedText style={[styles.balance, styles.cardValue]}>
              {formatCurrency(dashboardData.currentBalance)}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.card}>
            <ThemedText style={styles.cardLabel}>Receitas do Mês</ThemedText>
            <ThemedText style={[styles.income, styles.cardValue]}>
              {formatCurrency(dashboardData.monthlyIncome)}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.card}>
            <ThemedText style={styles.cardLabel}>Despesas do Mês</ThemedText>
            <ThemedText style={[styles.expense, styles.cardValue]}>
              {formatCurrency(dashboardData.monthlyExpense)}
            </ThemedText>
          </ThemedView>

          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("/dashboard/details")}
          >
            <ThemedText style={styles.buttonText}>Ver Detalhes</ThemedText>
          </TouchableOpacity>
        </ThemedView>
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
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  cardsContainer: {
    flex: 1,
    gap: 20,
  },
  card: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  cardValue: {
    fontSize: 28,
    fontWeight: "bold",
  },
  balance: {
    color: "#28a745",
  },
  income: {
    color: "#28a745",
  },
  expense: {
    color: "#dc3545",
  },
  button: {
    backgroundColor: "#007bff",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
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
  },
  clearButton: {
    alignItems: "center",
    padding: 12,
  },
  clearButtonText: {
    color: "#dc3545",
    fontSize: 16,
    fontWeight: "500",
  },
  seedButton: {
    alignItems: "center",
    padding: 12,
  },
  seedButtonText: {
    color: "#007bff",
    fontSize: 16,
    fontWeight: "500",
  },
});

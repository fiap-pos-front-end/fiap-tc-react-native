import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
} from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useDashboard } from "@/contexts/DashboardContext";

export default function DashboardDetailsScreen() {
  const { dashboardData, loading, error } = useDashboard();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <ThemedText style={styles.loadingText}>
            Carregando detalhes...
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
      <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.content}>
          <ThemedView style={styles.header}>
            <ThemedText style={styles.title}>Detalhes Financeiros</ThemedText>
            <ThemedText style={styles.subtitle}>
              Análise detalhada das suas transações
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>
              Receitas por Categoria
            </ThemedText>
            {dashboardData.incomeByCategory.length > 0 ? (
              <ThemedView style={styles.itemsContainer}>
                {dashboardData.incomeByCategory.map((item, index) => (
                  <ThemedView key={index} style={styles.item}>
                    <ThemedView style={styles.itemLeft}>
                      <ThemedText style={styles.itemIcon}>
                        {item.icon}
                      </ThemedText>
                      <ThemedText style={styles.itemName}>
                        {item.categoryName}
                      </ThemedText>
                    </ThemedView>
                    <ThemedText style={styles.income}>
                      {formatCurrency(item.amount)}
                    </ThemedText>
                  </ThemedView>
                ))}
              </ThemedView>
            ) : (
              <ThemedView style={styles.noDataContainer}>
                <ThemedText style={styles.noData}>
                  Nenhum dado de receita disponível
                </ThemedText>
              </ThemedView>
            )}
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>
              Despesas por Categoria
            </ThemedText>
            {dashboardData.expenseByCategory.length > 0 ? (
              <ThemedView style={styles.itemsContainer}>
                {dashboardData.expenseByCategory.map((item, index) => (
                  <ThemedView key={index} style={styles.item}>
                    <ThemedView style={styles.itemLeft}>
                      <ThemedText style={styles.itemIcon}>
                        {item.icon}
                      </ThemedText>
                      <ThemedText style={styles.itemName}>
                        {item.categoryName}
                      </ThemedText>
                    </ThemedView>
                    <ThemedText style={styles.expense}>
                      {formatCurrency(item.amount)}
                    </ThemedText>
                  </ThemedView>
                ))}
              </ThemedView>
            ) : (
              <ThemedView style={styles.noDataContainer}>
                <ThemedText style={styles.noData}>
                  Nenhum dado de despesa disponível
                </ThemedText>
              </ThemedView>
            )}
          </ThemedView>

          <ThemedView style={styles.summary}>
            <ThemedText style={styles.summaryTitle}>Resumo do Mês</ThemedText>
            <ThemedView style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Receitas:</ThemedText>
              <ThemedText style={styles.summaryIncome}>
                {formatCurrency(dashboardData.monthlyIncome)}
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Despesas:</ThemedText>
              <ThemedText style={styles.summaryExpense}>
                {formatCurrency(dashboardData.monthlyExpense)}
              </ThemedText>
            </ThemedView>
            <ThemedView style={[styles.summaryRow, styles.summaryTotal]}>
              <ThemedText style={styles.summaryTotalLabel}>
                Economia:
              </ThemedText>
              <ThemedText style={styles.savings}>
                {formatCurrency(dashboardData.savings)}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ScrollView>
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
  scrollView: {
    flex: 1,
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
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  itemsContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  itemIcon: {
    fontSize: 24,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  income: {
    color: "#28a745",
    fontWeight: "700",
    fontSize: 16,
  },
  expense: {
    color: "#dc3545",
    fontWeight: "700",
    fontSize: 16,
  },
  summary: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingTop: 16,
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#666",
  },
  summaryTotalLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  summaryIncome: {
    fontSize: 16,
    fontWeight: "600",
    color: "#28a745",
  },
  summaryExpense: {
    fontSize: 16,
    fontWeight: "600",
    color: "#dc3545",
  },
  savings: {
    color: "#28a745",
    fontSize: 20,
    fontWeight: "700",
  },
  noDataContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noData: {
    textAlign: "center",
    color: "#6c757d",
    fontStyle: "italic",
    fontSize: 16,
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
});

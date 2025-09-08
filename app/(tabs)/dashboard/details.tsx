import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View, 
  Text, 
  Dimensions,
} from "react-native";
import React from "react";
import {
  LineChart,
  BarChart,
  PieChart,
} from "react-native-chart-kit";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useDashboard } from "@/contexts/DashboardContext";

export default function DashboardDetailsScreen() {
  const { dashboardData, loading, error } = useDashboard();
  const screenWidth = Dimensions.get("window").width;

  const dataLine = {
    labels: dashboardData.getMonthlyIncomeExpense.map((item) => item.month),
    datasets: [
      {
        data: dashboardData.getMonthlyIncomeExpense.map((item) => item.income),
        color: () => "#4CAF50",
        strokeWidth: 2,
      },
      {
        data: dashboardData.getMonthlyIncomeExpense.map((item) => item.expense),
        color: () => "#F44336",
        strokeWidth: 2,
      },
    ],
  };

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

          <ThemedView style={styles.summary}>
            <ThemedText style={styles.summaryTitle}>Todas transações</ThemedText>
            <ThemedView style={styles.circleGrid}>

              <ThemedView style={styles.circleWrapper}>
                <ThemedText style={styles.circleTitle}>Total em Receita</ThemedText>
                <ThemedView style={[styles.circleCard, { borderColor: "#28a745", borderWidth: 12}]}>
                  <ThemedText style={[styles.circleText, { color: "#28a745" }]}>
                    {formatCurrency(dashboardData.totalIncome)}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
  
              <ThemedView style={styles.circleWrapper}>
                <ThemedText style={styles.circleTitle}>Total em Despesas</ThemedText>
                <ThemedView style={[styles.circleCard, { borderColor: "#dc3545", borderWidth: 12}]}>
                  <ThemedText style={[styles.circleText, { color: "#dc3545" }]}>
                    {formatCurrency(dashboardData.totalExpense)}
                  </ThemedText>
                </ThemedView>
              </ThemedView>

              <ThemedView style={styles.circleWrapper}>
                <ThemedText style={styles.circleTitle}>Maior receita</ThemedText>
                <ThemedView style={[styles.circleCard, { borderColor: "#28a745", borderWidth: 12}]}>
                  <ThemedText style={[styles.circleText, { color: "#28a745" }]}>
                    {formatCurrency(dashboardData.topIncomeCategory[0].amount)}
                  </ThemedText>
                </ThemedView>
                <ThemedText style={styles.circleTitle}>
                  <ThemedText>{dashboardData.topIncomeCategory[0].categoryName}</ThemedText>
                  <ThemedText>{dashboardData.topIncomeCategory[0].icon}</ThemedText>
                </ThemedText>
              </ThemedView>

              <ThemedView style={styles.circleWrapper}>
                <ThemedText style={styles.circleTitle}>Maior Despesa</ThemedText>
                <ThemedView style={[styles.circleCard, { borderColor: "#dc3545", borderWidth: 12}]}>
                  <ThemedText style={[styles.circleText, { color: "#dc3545" }]}>
                    {formatCurrency(dashboardData.topExpenseCategory[0].amount)}
                  </ThemedText>
                </ThemedView>
                <ThemedText style={styles.circleTitle}>
                  <ThemedText>{dashboardData.topExpenseCategory[0].categoryName}</ThemedText>
                  <ThemedText>{dashboardData.topExpenseCategory[0].icon}</ThemedText>
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>

          {/* <ThemedView style={styles.section}>
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
          </ThemedView> */}

          <ThemedView style={[styles.card]} >
            <ThemedText style={{ textAlign: "center", fontSize: 20, marginVertical: 10 }}>
              Análise de Movimentações Anual
            </ThemedText>
            <LineChart
              data={dataLine}
              width={screenWidth - 50}
              height={240}
              chartConfig={{
                backgroundColor: "#ffff",
                backgroundGradientFrom: "#ffff",
                backgroundGradientTo: "#ffff",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
              }}
              bezier
              style={{ marginVertical: 8, borderRadius: 16 }}
            />
          </ThemedView>

        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
    marginBottom:10,
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
  rowCards: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16
  },
  smallCard: {
    flex: 1,
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    backgroundColor: "#fff",
  },
  smallCardText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  circleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 23,
  },
  circleWrapper: {
    alignItems: "center",
    width: "45%",
  },
  circleCard: {
    width: 150,
    height: 150,
    borderRadius: 100,
    borderWidth: 3,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  circleText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  circleTitle: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent:'center',
    backgroundColor: 'transparent',
    alignItems: 'center',
    gap: 1,
  },
  card: {
    padding: 15,
    borderRadius: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom:10,
  },

});

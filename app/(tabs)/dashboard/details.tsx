import { ActivityIndicator, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useDashboard } from '@/contexts/DashboardContext';

export default function DashboardDetailsScreen() {
  const { dashboardData, loading, error } = useDashboard();

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size='large' color='#007bff' />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.errorText}>Error: {error}</ThemedText>
      </ThemedView>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type='title'>Detalhes Financeiros</ThemedText>
        <ThemedText type='subtitle'>Análise detalhada das suas transações</ThemedText>
      </ThemedView>

      <ThemedView style={styles.content}>
        <ThemedView style={styles.section}>
          <ThemedText type='defaultSemiBold' style={styles.sectionTitle}>
            Receitas por Categoria
          </ThemedText>
          {dashboardData.incomeByCategory.length > 0 ? (
            dashboardData.incomeByCategory.map((item, index) => (
              <ThemedView key={index} style={styles.item}>
                <ThemedView style={styles.itemLeft}>
                  <ThemedText style={styles.itemIcon}>{item.icon}</ThemedText>
                  <ThemedText>{item.categoryName}</ThemedText>
                </ThemedView>
                <ThemedText style={styles.income}>{formatCurrency(item.amount)}</ThemedText>
              </ThemedView>
            ))
          ) : (
            <ThemedText style={styles.noData}>Nenhum dado de receita disponível</ThemedText>
          )}
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type='defaultSemiBold' style={styles.sectionTitle}>
            Despesas por Categoria
          </ThemedText>
          {dashboardData.expenseByCategory.length > 0 ? (
            dashboardData.expenseByCategory.map((item, index) => (
              <ThemedView key={index} style={styles.item}>
                <ThemedView style={styles.itemLeft}>
                  <ThemedText style={styles.itemIcon}>{item.icon}</ThemedText>
                  <ThemedText>{item.categoryName}</ThemedText>
                </ThemedView>
                <ThemedText style={styles.expense}>{formatCurrency(item.amount)}</ThemedText>
              </ThemedView>
            ))
          ) : (
            <ThemedText style={styles.noData}>Nenhum dado de despesa disponível</ThemedText>
          )}
        </ThemedView>

        <ThemedView style={styles.summary}>
          <ThemedText type='defaultSemiBold'>Resumo</ThemedText>
          <ThemedText>Receitas: {formatCurrency(dashboardData.monthlyIncome)}</ThemedText>
          <ThemedText>Despesas: {formatCurrency(dashboardData.monthlyExpense)}</ThemedText>
          <ThemedText type='defaultSemiBold' style={styles.savings}>
            Economia: {formatCurrency(dashboardData.savings)}
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  content: {
    flex: 1,
    gap: 25,
  },
  section: {
    gap: 15,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  income: {
    color: '#28a745',
    fontWeight: '600',
  },
  expense: {
    color: '#dc3545',
    fontWeight: '600',
  },
  summary: {
    padding: 20,
    backgroundColor: '#e9ecef',
    borderRadius: 12,
    gap: 8,
    alignItems: 'center',
  },
  savings: {
    color: '#28a745',
    fontSize: 18,
    marginTop: 10,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f8f9fa',
  },
  itemIcon: {
    fontSize: 20,
  },
  noData: {
    textAlign: 'center',
    color: '#6c757d',
    fontStyle: 'italic',
    padding: 20,
  },
});

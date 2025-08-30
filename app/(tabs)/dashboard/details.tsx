import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function DashboardDetailsScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Detalhes Financeiros</ThemedText>
        <ThemedText type="subtitle">Análise detalhada das suas transações</ThemedText>
      </ThemedView>

      <ThemedView style={styles.content}>
        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Receitas por Categoria
          </ThemedText>
          <ThemedView style={styles.item}>
            <ThemedText>Salário</ThemedText>
            <ThemedText style={styles.income}>R$ 3.000,00</ThemedText>
          </ThemedView>
          <ThemedView style={styles.item}>
            <ThemedText>Freelance</ThemedText>
            <ThemedText style={styles.income}>R$ 500,00</ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Despesas por Categoria
          </ThemedText>
          <ThemedView style={styles.item}>
            <ThemedText>Moradia</ThemedText>
            <ThemedText style={styles.expense}>R$ 1.200,00</ThemedText>
          </ThemedView>
          <ThemedView style={styles.item}>
            <ThemedText>Alimentação</ThemedText>
            <ThemedText style={styles.expense}>R$ 600,00</ThemedText>
          </ThemedView>
          <ThemedView style={styles.item}>
            <ThemedText>Transporte</ThemedText>
            <ThemedText style={styles.expense}>R$ 300,00</ThemedText>
          </ThemedView>
          <ThemedView style={styles.item}>
            <ThemedText>Lazer</ThemedText>
            <ThemedText style={styles.expense}>R$ 150,00</ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.summary}>
          <ThemedText type="defaultSemiBold">Resumo</ThemedText>
          <ThemedText>Receitas: R$ 3.500,00</ThemedText>
          <ThemedText>Despesas: R$ 2.250,00</ThemedText>
          <ThemedText type="defaultSemiBold" style={styles.savings}>
            Economia: R$ 1.250,00
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
});

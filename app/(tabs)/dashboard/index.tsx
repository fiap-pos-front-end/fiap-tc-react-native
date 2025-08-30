import { useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function DashboardScreen() {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Dashboard</ThemedText>
        <ThemedText type="subtitle">Visão geral das suas finanças</ThemedText>
      </ThemedView>

      <ThemedView style={styles.content}>
        <ThemedView style={styles.card}>
          <ThemedText type="defaultSemiBold">Saldo Atual</ThemedText>
          <ThemedText type="title" style={styles.balance}>R$ 5.250,00</ThemedText>
        </ThemedView>

        <ThemedView style={styles.card}>
          <ThemedText type="defaultSemiBold">Receitas do Mês</ThemedText>
          <ThemedText type="subtitle" style={styles.income}>R$ 3.500,00</ThemedText>
        </ThemedView>

        <ThemedView style={styles.card}>
          <ThemedText type="defaultSemiBold">Despesas do Mês</ThemedText>
          <ThemedText type="subtitle" style={styles.expense}>R$ 2.250,00</ThemedText>
        </ThemedView>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/dashboard/details')}
        >
          <ThemedText style={styles.buttonText}>Ver Detalhes</ThemedText>
        </TouchableOpacity>
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
    gap: 20,
  },
  card: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    gap: 8,
  },
  balance: {
    fontSize: 32,
    color: '#28a745',
  },
  income: {
    fontSize: 24,
    color: '#28a745',
  },
  expense: {
    fontSize: 24,
    color: '#dc3545',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

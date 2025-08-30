import { useRouter } from 'expo-router';
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useCategories } from '@/contexts/CategoryContext';
import { useDashboard } from '@/contexts/DashboardContext';
import { useTransfers } from '@/contexts/TransferContext';
import { forceClearAllData } from '@/utils/clearStorage';

export default function DashboardScreen() {
  const router = useRouter();
  const { dashboardData, loading, error } = useDashboard();
  const { categories, seedCategories } = useCategories();
  const { transfers, seedTransfers } = useTransfers();

  // Check if we have any data
  const hasData = categories.length > 0 || transfers.length > 0;

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
        <ThemedText style={styles.errorText}>Erro: {error}</ThemedText>
      </ThemedView>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleClearStorage = async () => {
    Alert.alert('Limpar Todos os Dados', 'Isso removerá todas as categorias e transferências. Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Limpar Tudo',
        style: 'destructive',
        onPress: async () => {
          try {
            await forceClearAllData();
            Alert.alert('Sucesso', 'Todos os dados foram limpos. Por favor, reinicie o app para ver as mudanças.');
          } catch (error) {
            Alert.alert('Erro', 'Falha ao limpar dados do storage');
          }
        },
      },
    ]);
  };

  const handleSeedData = async () => {
    Alert.alert('Criar Dados Iniciais', 'Isso criará categorias e transferências de exemplo. Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Criar Dados',
        style: 'default',
        onPress: async () => {
          try {
            await seedCategories();
            await seedTransfers();

            Alert.alert('Sucesso', 'Dados iniciais criados com sucesso!');
          } catch (error) {
            Alert.alert('Erro', 'Falha ao criar dados iniciais');
          }
        },
      },
    ]);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type='title'>Dashboard</ThemedText>
        <ThemedText type='subtitle'>Visão geral das suas finanças</ThemedText>
      </ThemedView>

      <ThemedView style={styles.content}>
        <ThemedView style={styles.card}>
          <ThemedText type='defaultSemiBold'>Saldo Atual</ThemedText>
          <ThemedText type='title' style={styles.balance}>
            {formatCurrency(dashboardData.currentBalance)}
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.card}>
          <ThemedText type='defaultSemiBold'>Receitas do Mês</ThemedText>
          <ThemedText type='subtitle' style={styles.income}>
            {formatCurrency(dashboardData.monthlyIncome)}
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.card}>
          <ThemedText type='defaultSemiBold'>Despesas do Mês</ThemedText>
          <ThemedText type='subtitle' style={styles.expense}>
            {formatCurrency(dashboardData.monthlyExpense)}
          </ThemedText>
        </ThemedView>

        <TouchableOpacity style={styles.button} onPress={() => router.push('/dashboard/details')}>
          <ThemedText style={styles.buttonText}>Ver Detalhes</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={hasData ? styles.clearButton : styles.seedButton}
          onPress={hasData ? handleClearStorage : handleSeedData}
        >
          <ThemedText style={hasData ? styles.clearButtonText : styles.seedButtonText}>
            {hasData ? 'Limpar dados' : 'Criar dados iniciais'}
          </ThemedText>
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
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  clearButton: {
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#dc3545',
    fontSize: 14,
  },
  seedButton: {
    alignItems: 'center',
  },
  seedButtonText: {
    color: '#007bff',
    fontSize: 14,
  },
});

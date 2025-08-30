import { useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useCategories } from '@/contexts/CategoryContext';
import { useTransfers } from '@/contexts/TransferContext';
import { TransactionType, Transfer } from '@/types';

export default function TransferenciasScreen() {
  const router = useRouter();
  const { transfers, loading, error } = useTransfers();
  const { categories } = useCategories();

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color="#007bff" />
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

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  const formatarValor = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const renderTransferencia = ({ item }: { item: Transfer }) => {
    const category = categories.find(cat => cat.id === item.categoryId);

    return (
      <TouchableOpacity
        style={[styles.transferenciaItem, {
          borderLeftColor: item.type === TransactionType.INCOME ? '#28a745' : '#dc3545'
        }]}
        onPress={() => router.push(`/transferencias/detalhes?id=${item.id}` as any)}
      >
        <ThemedView style={styles.transferenciaInfo}>
          <ThemedText style={styles.icone}>{category?.icon || '📊'}</ThemedText>
          <ThemedView style={styles.transferenciaText}>
            <ThemedText type="defaultSemiBold">{item.description}</ThemedText>
            <ThemedText style={styles.categoria}>{category?.name || 'Categoria não encontrada'}</ThemedText>
            <ThemedText style={styles.data}>{formatarData(item.date)}</ThemedText>
          </ThemedView>
        </ThemedView>
        <ThemedView style={styles.valorContainer}>
          <ThemedText style={[
            styles.valor,
            { color: item.type === TransactionType.INCOME ? '#28a745' : '#dc3545' }
          ]}>
            {item.type === TransactionType.INCOME ? '+' : '-'} {formatarValor(item.amount)}
          </ThemedText>
          <ThemedText style={styles.arrow}>›</ThemedText>
        </ThemedView>
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Transferências</ThemedText>
        <ThemedText type="subtitle">Histórico de suas transações financeiras</ThemedText>
      </ThemedView>

      <FlatList
        data={transfers}
        renderItem={renderTransferencia}
        keyExtractor={(item) => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/transferencias/nova' as any)}
      >
        <ThemedText style={styles.fabText}>+</ThemedText>
      </TouchableOpacity>
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
  list: {
    flex: 1,
  },
  transferenciaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  transferenciaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  icone: {
    fontSize: 24,
    marginRight: 15,
  },
  transferenciaText: {
    flex: 1,
    gap: 4,
    backgroundColor: '#f8f9fa'
  },
  categoria: {
    fontSize: 14,
    color: '#6c757d',
  },
  data: {
    fontSize: 12,
    color: '#6c757d',
  },
  valorContainer: {
    alignItems: 'flex-end',
    gap: 5,
    backgroundColor: '#f8f9fa'
  },
  valor: {
    fontSize: 16,
    fontWeight: '600',
  },
  arrow: {
    fontSize: 20,
    color: '#6c757d',
  },
  fab: {
    position: 'absolute',
    bottom: 100, // Increased to be above the tab bar
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10, // Increased elevation for Android
    zIndex: 1000, // High z-index for iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  fabText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 28, // Match font size for perfect centering
    includeFontPadding: false, // Remove extra padding on Android
  },
  errorText: {
    color: '#dc3545',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

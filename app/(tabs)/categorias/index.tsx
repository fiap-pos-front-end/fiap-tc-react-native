import { useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useCategories } from '@/contexts/CategoryContext';
import { TransactionType } from '@/types';

export default function CategoriasScreen() {
  const router = useRouter();
  const { categories, loading, error } = useCategories();

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

  const renderCategoria = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.categoriaItem,
        {
          borderLeftColor: item.type === TransactionType.INCOME ? '#28a745' : '#dc3545'
        }
      ]}
      onPress={() => router.push(`/categorias/detalhes?id=${item.id}` as any)}
    >
      <ThemedView style={styles.categoriaInfo}>
        <ThemedText style={styles.icone}>{item.icon}</ThemedText>
        <ThemedView style={styles.categoriaText}>
          <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
          <ThemedText style={[
            styles.tipo,
            {
              color: item.type === TransactionType.INCOME ? '#28a745' : '#dc3545'
            }
          ]}>
            {item.type === TransactionType.INCOME ? 'Receita' : 'Despesa'}
          </ThemedText>
        </ThemedView>
      </ThemedView>
      <ThemedText style={styles.arrow}>›</ThemedText>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Categorias</ThemedText>
        <ThemedText type="subtitle">Gerencie suas categorias financeiras</ThemedText>
      </ThemedView>

      <FlatList
        data={categories}
        renderItem={renderCategoria}
        keyExtractor={(item) => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/categorias/nova' as any)}
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
  categoriaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa', // Light gray background for each item
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
  },
  categoriaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  icone: {
    fontSize: 24,
    marginRight: 15,
  },
  categoriaText: {
    flex: 1,
    gap: 4,
    backgroundColor: '#f8f9fa'
  },
  tipo: {
    fontSize: 12,
    textTransform: 'capitalize',
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

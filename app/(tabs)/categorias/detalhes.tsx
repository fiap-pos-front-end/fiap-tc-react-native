import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useCategories } from '@/contexts/CategoryContext';
import { Category, TransactionType } from '@/types';

export default function CategoriaDetalhesScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { categories, getCategoryById, loading, deleteCategory } = useCategories();
  const [categoria, setCategoria] = useState<Category | null>(null);

  useEffect(() => {
    if (id && categories.length > 0) {
      const found = getCategoryById(id);
      if (found) {
        setCategoria(found);
      } else {
        setCategoria(null);
      }
    }
  }, [id, getCategoryById, categories]);

  const handleExcluir = () => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir esta categoria?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            if (!categoria) return;
            try {
              await deleteCategory(categoria.id);
              Alert.alert('Sucesso', 'Categoria excluída com sucesso!', [
                { text: 'OK', onPress: () => router.back() }
              ]);
            } catch (error) {
              Alert.alert('Erro', 'Falha ao excluir categoria');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#007bff" />
        <ThemedText style={styles.loadingText}>Carregando...</ThemedText>
      </ThemedView>
    );
  }

  if (!categoria) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <ThemedText style={styles.errorText}>Categoria não encontrada</ThemedText>
        <ThemedText style={styles.errorSubtext}>ID: {id}</ThemedText>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ThemedText style={styles.backButtonText}>Voltar</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.icone}>{categoria.icon}</ThemedText>
        <ThemedText type="title">{categoria.name}</ThemedText>
      </ThemedView>

      <ThemedView style={styles.content}>
        <ThemedView style={styles.infoSection}>
          <ThemedView style={styles.infoItem}>
            <ThemedText type="defaultSemiBold">Nome</ThemedText>
            <ThemedText>{categoria.name}</ThemedText>
          </ThemedView>

          <ThemedView style={styles.infoItem}>
            <ThemedText type="defaultSemiBold">Tipo</ThemedText>
            <ThemedText style={{
              color: categoria.type === TransactionType.INCOME ? '#28a745' : '#dc3545',
              textTransform: 'capitalize'
            }}>
              {categoria.type === TransactionType.INCOME ? 'Receita' : 'Despesa'}
            </ThemedText>
          </ThemedView>


        </ThemedView>

        <ThemedView style={styles.actions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push(`/categorias/editar?id=${categoria.id}` as any)}
          >
            <ThemedText style={styles.editButtonText}>Editar</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleExcluir}
          >
            <ThemedText style={styles.deleteButtonText}>Excluir</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 20, // Reduced from 40 to 20 for less space above
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10, // Reduced from 20 to 10 for less space above icon
    minHeight: 120, // Reduced from 140 to 120 for more compact header
  },
  icone: {
    fontSize: 56, // Increased icon size for better visibility
    marginBottom: 15, // Reduced from 20 to 15 for less space below icon
    textAlign: 'center', // Ensure icon is centered
    marginTop: 5, // Reduced from 10 to 5 for less space above icon
    minHeight: 60, // Ensure icon container has proper height
    lineHeight: 56, // Match font size for proper vertical centering
  },
  content: {
    flex: 1,
    gap: 25,
    paddingBottom: 40, // Add bottom padding for better spacing
  },
  infoSection: {
    gap: 15,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15, // Increased padding for better touch targets
    paddingHorizontal: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    minHeight: 50, // Ensure minimum height for info items
  },

  actions: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 20,
    marginBottom: 20, // Add bottom margin for better spacing
  },
  editButton: {
    flex: 1,
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 50, // Ensure minimum height for buttons
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 50, // Ensure minimum height for buttons
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 50,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 15,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

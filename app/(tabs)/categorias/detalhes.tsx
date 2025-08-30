import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

const categorias = [
  { id: '1', nome: 'Moradia', tipo: 'despesa', cor: '#dc3545', icone: '🏠' },
  { id: '2', nome: 'Alimentação', tipo: 'despesa', cor: '#dc3545', icone: '🍽️' },
  { id: '3', nome: 'Transporte', tipo: 'despesa', cor: '#dc3545', icone: '🚗' },
  { id: '4', nome: 'Lazer', tipo: 'despesa', cor: '#dc3545', icone: '🎮' },
  { id: '5', nome: 'Salário', tipo: 'receita', cor: '#28a745', icone: '💰' },
  { id: '6', nome: 'Freelance', tipo: 'receita', cor: '#28a745', icone: '💼' },
  { id: '7', nome: 'Investimentos', tipo: 'receita', cor: '#28a745', icone: '📈' },
];

export default function CategoriaDetalhesScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [categoria, setCategoria] = useState<typeof categorias[0] | null>(null);

  useEffect(() => {
    if (id) {
      const found = categorias.find(cat => cat.id === id);
      if (found) {
        setCategoria(found);
      }
    }
  }, [id]);

  const handleExcluir = () => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir esta categoria?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            // Aqui você implementaria a lógica para excluir a categoria
            Alert.alert('Sucesso', 'Categoria excluída com sucesso!', [
              { text: 'OK', onPress: () => router.back() }
            ]);
          }
        }
      ]
    );
  };

  if (!categoria) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Categoria não encontrada</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.icone}>{categoria.icone}</ThemedText>
        <ThemedText type="title">{categoria.nome}</ThemedText>
      </ThemedView>

      <ThemedView style={styles.content}>
        <ThemedView style={styles.infoSection}>
          <ThemedView style={styles.infoItem}>
            <ThemedText type="defaultSemiBold">Nome</ThemedText>
            <ThemedText>{categoria.nome}</ThemedText>
          </ThemedView>

          <ThemedView style={styles.infoItem}>
            <ThemedText type="defaultSemiBold">Tipo</ThemedText>
            <ThemedText style={{
              color: categoria.tipo === 'receita' ? '#28a745' : '#dc3545',
              textTransform: 'capitalize'
            }}>
              {categoria.tipo}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.infoItem}>
            <ThemedText type="defaultSemiBold">Ícone</ThemedText>
            <ThemedText style={styles.iconeDisplay}>{categoria.icone}</ThemedText>
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
  iconeDisplay: {
    fontSize: 24,
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
});

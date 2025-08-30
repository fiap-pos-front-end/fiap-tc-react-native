import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useCategories } from '@/contexts/CategoryContext';
import { useTransfers } from '@/contexts/TransferContext';
import { TransactionType, Transfer } from '@/types';

export default function DetalhesTransferenciaScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { transfers, getTransferById, loading, deleteTransfer } = useTransfers();
  const { categories } = useCategories();
  const [transferencia, setTransferencia] = useState<Transfer | null>(null);

  useEffect(() => {
    if (id && transfers.length > 0) {
      const found = getTransferById(id);
      if (found) {
        setTransferencia(found);
      } else {
        setTransferencia(null);
      }
    }
  }, [id, getTransferById, transfers]);

  const formatarData = (dataString: string) => {
    if (!dataString) return '';

    // Parse the date string manually to avoid timezone issues
    const [year, month, day] = dataString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed

    return date.toLocaleDateString('pt-BR');
  };

  const formatarValor = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size='large' color='#007bff' />
        <ThemedText style={styles.loadingText}>Carregando...</ThemedText>
      </ThemedView>
    );
  }

  if (!transferencia) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <ThemedText style={styles.errorText}>Transferência não encontrada</ThemedText>
        <ThemedText style={styles.errorSubtext}>ID: {id}</ThemedText>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ThemedText style={styles.backButtonText}>Voltar</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.icone}>
          {categories.find((cat) => cat.id === transferencia.categoryId)?.icon || '📊'}
        </ThemedText>
        <ThemedText type='title'>{transferencia.description}</ThemedText>
      </ThemedView>

      <ThemedView style={styles.content}>
        <ThemedView style={styles.card}>
          <ThemedText type='defaultSemiBold' style={styles.cardTitle}>
            Valor
          </ThemedText>
          <ThemedText
            style={[styles.valor, { color: transferencia.type === TransactionType.INCOME ? '#28a745' : '#dc3545' }]}
          >
            {transferencia.type === TransactionType.INCOME ? '+' : '-'} {formatarValor(transferencia.amount)}
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.infoSection}>
          <ThemedView style={styles.infoItem}>
            <ThemedText type='defaultSemiBold'>Data</ThemedText>
            <ThemedText>{formatarData(transferencia.date)}</ThemedText>
          </ThemedView>

          <ThemedView style={styles.infoItem}>
            <ThemedText type='defaultSemiBold'>Tipo</ThemedText>
            <ThemedText
              style={{
                color: transferencia.type === TransactionType.INCOME ? '#28a745' : '#dc3545',
                textTransform: 'capitalize',
              }}
            >
              {transferencia.type === TransactionType.INCOME ? 'Receita' : 'Despesa'}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.infoItem}>
            <ThemedText type='defaultSemiBold'>Categoria</ThemedText>
            <ThemedText>
              {categories.find((cat) => cat.id === transferencia.categoryId)?.name || 'Categoria não encontrada'}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {transferencia.notes && (
          <ThemedView style={styles.observacoesSection}>
            <ThemedText type='defaultSemiBold' style={styles.sectionTitle}>
              Observações
            </ThemedText>
            <ThemedText>{transferencia.notes}</ThemedText>
          </ThemedView>
        )}

        <ThemedView style={styles.actions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push(`/transferencias/editar?id=${transferencia.id}`)}
          >
            <ThemedText style={styles.editButtonText}>Editar</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => {
              Alert.alert('Confirmar Exclusão', 'Tem certeza que deseja excluir esta transferência?', [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Excluir',
                  style: 'destructive',
                  onPress: async () => {
                    if (!transferencia) return;
                    try {
                      await deleteTransfer(transferencia.id);
                      Alert.alert('Sucesso', 'Transferência excluída com sucesso!', [
                        { text: 'OK', onPress: () => router.back() },
                      ]);
                    } catch (error) {
                      Alert.alert('Erro', 'Falha ao excluir transferência');
                    }
                  },
                },
              ]);
            }}
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
    paddingTop: 20, // Match categorias detalhes
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10, // Match categorias detalhes
    minHeight: 120, // Match categorias detalhes
  },
  icone: {
    fontSize: 56, // Match categorias detalhes
    marginBottom: 15, // Match categorias detalhes
    textAlign: 'center', // Match categorias detalhes
    marginTop: 5, // Match categorias detalhes
    minHeight: 60, // Match categorias detalhes
    lineHeight: 56, // Match categorias detalhes
  },
  content: {
    flex: 1,
    gap: 25,
    paddingBottom: 40, // Match categorias detalhes
  },
  card: {
    padding: 25,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    gap: 10,
    minHeight: 100, // Ensure card has enough height for price display
  },
  cardTitle: {
    fontSize: 16,
    color: '#6c757d',
  },
  valor: {
    fontSize: 36,
    fontWeight: 'bold',
    minHeight: 45, // Ensure price text has enough height
    lineHeight: 36, // Match font size for proper vertical centering
    textAlign: 'center', // Ensure price is centered
  },
  infoSection: {
    gap: 15,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15, // Match categorias detalhes
    paddingHorizontal: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    minHeight: 50, // Match categorias detalhes
  },
  observacoesSection: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 5,
  },
  actions: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 20,
    marginBottom: 20, // Match categorias detalhes
  },
  editButton: {
    flex: 1,
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 50, // Match categorias detalhes
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
    minHeight: 50, // Match categorias detalhes
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

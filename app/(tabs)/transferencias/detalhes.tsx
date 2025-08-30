import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

const transferencias = [
  {
    id: '1',
    descricao: 'Salário',
    valor: 3000.00,
    tipo: 'receita',
    categoria: 'Salário',
    data: '2024-01-15',
    icone: '💰',
    observacoes: 'Salário mensal da empresa XYZ',
    conta: 'Banco Principal',
    status: 'confirmado'
  },
  {
    id: '2',
    descricao: 'Aluguel',
    valor: 1200.00,
    tipo: 'despesa',
    categoria: 'Moradia',
    data: '2024-01-10',
    icone: '🏠',
    observacoes: 'Aluguel do apartamento',
    conta: 'Banco Principal',
    status: 'confirmado'
  },
  {
    id: '3',
    descricao: 'Supermercado',
    valor: 450.00,
    tipo: 'despesa',
    categoria: 'Alimentação',
    data: '2024-01-12',
    icone: '🍽️',
    observacoes: 'Compras do mês',
    conta: 'Cartão de Crédito',
    status: 'pendente'
  },
  {
    id: '4',
    descricao: 'Freelance',
    valor: 500.00,
    tipo: 'receita',
    categoria: 'Freelance',
    data: '2024-01-08',
    icone: '💼',
    observacoes: 'Projeto de design',
    conta: 'Banco Principal',
    status: 'confirmado'
  },
  {
    id: '5',
    descricao: 'Combustível',
    valor: 150.00,
    tipo: 'despesa',
    categoria: 'Transporte',
    data: '2024-01-14',
    icone: '🚗',
    observacoes: 'Abastecimento do carro',
    conta: 'Cartão de Crédito',
    status: 'pendente'
  }
];

export default function DetalhesTransferenciaScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [transferencia, setTransferencia] = useState<typeof transferencias[0] | null>(null);

  useEffect(() => {
    if (id) {
      const found = transferencias.find(t => t.id === id);
      if (found) {
        setTransferencia(found);
      }
    }
  }, [id]);

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

  if (!transferencia) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Transferência não encontrada</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.icone}>{transferencia.icone}</ThemedText>
        <ThemedText type="title">{transferencia.descricao}</ThemedText>
      </ThemedView>

      <ThemedView style={styles.content}>
        <ThemedView style={styles.card}>
          <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
            Valor
          </ThemedText>
          <ThemedText style={[
            styles.valor,
            { color: transferencia.tipo === 'receita' ? '#28a745' : '#dc3545' }
          ]}>
            {transferencia.tipo === 'receita' ? '+' : '-'} {formatarValor(transferencia.valor)}
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.infoSection}>
          <ThemedView style={styles.infoItem}>
            <ThemedText type="defaultSemiBold">Data</ThemedText>
            <ThemedText>{formatarData(transferencia.data)}</ThemedText>
          </ThemedView>

          <ThemedView style={styles.infoItem}>
            <ThemedText type="defaultSemiBold">Tipo</ThemedText>
            <ThemedText style={{
              color: transferencia.tipo === 'receita' ? '#28a745' : '#dc3545',
              textTransform: 'capitalize'
            }}>
              {transferencia.tipo}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {transferencia.observacoes && (
          <ThemedView style={styles.observacoesSection}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Observações
            </ThemedText>
            <ThemedText>{transferencia.observacoes}</ThemedText>
          </ThemedView>
        )}

        <ThemedView style={styles.actions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => Alert.alert('Editar', 'Funcionalidade de edição será implementada')}
          >
            <ThemedText style={styles.editButtonText}>Editar</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => {
              Alert.alert(
                'Confirmar Exclusão',
                'Tem certeza que deseja excluir esta transferência?',
                [
                  { text: 'Cancelar', style: 'cancel' },
                  {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: () => {
                      Alert.alert('Sucesso', 'Transferência excluída com sucesso!', [
                        { text: 'OK', onPress: () => router.back() }
                      ]);
                    }
                  }
                ]
              );
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
});

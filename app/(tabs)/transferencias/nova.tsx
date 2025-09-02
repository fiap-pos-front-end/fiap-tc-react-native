import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

import { DatePicker } from '@/components/DatePicker';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useCategories } from '@/contexts/CategoryContext';
import { useTransfers } from '@/contexts/TransferContext';
import { TransactionType } from '@/types';

export default function NovaTransferenciaScreen() {
  const router = useRouter();
  const { categories } = useCategories();
  const { addTransfer } = useTransfers();
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState<TransactionType>(TransactionType.EXPENSE);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [data, setData] = useState(() => {
    // Set default date to today in local timezone to avoid timezone issues
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [observacoes, setObservacoes] = useState('');

  // Price formatting functions
  const formatPrice = (text: string) => {
    // Remove all non-numeric characters
    const numericValue = text.replace(/\D/g, '');

    if (numericValue === '') return '';

    // Convert to number and divide by 100 to get decimal places
    const value = parseInt(numericValue, 10) / 100;

    // Format as BRL currency
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const parsePrice = (formattedPrice: string) => {
    // Remove all non-numeric characters and convert to number
    const numericValue = formattedPrice.replace(/\D/g, '');
    return parseInt(numericValue, 10) / 100;
  };

  const handlePriceChange = (text: string) => {
    const formatted = formatPrice(text);
    setValor(formatted);
  };

  // Check if we have categories before allowing transfer creation
  if (categories.length === 0) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView style={styles.header}>
          <ThemedText type='title'>Nova Transferência</ThemedText>
          <ThemedText type='subtitle'>Registre uma nova transação financeira</ThemedText>
        </ThemedView>

        <ThemedView style={styles.noCategoriesContainer}>
          <ThemedText style={styles.noCategoriesIcon}>📊</ThemedText>
          <ThemedText type='defaultSemiBold' style={styles.noCategoriesTitle}>
            Nenhuma categoria encontrada
          </ThemedText>
          <ThemedText style={styles.noCategoriesMessage}>
            Para criar uma transferência, você precisa primeiro criar pelo menos uma categoria.
          </ThemedText>
          <TouchableOpacity style={styles.createCategoryButton} onPress={() => router.push('/categorias/nova')}>
            <ThemedText style={styles.createCategoryButtonText}>Criar Primeira Categoria</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    );
  }

  const categoriasFiltradas = categories;

  const handleSalvar = async () => {
    if (!descricao.trim()) {
      Alert.alert('Erro', 'Por favor, insira uma descrição para a transferência');
      return;
    }

    if (!valor.trim()) {
      Alert.alert('Erro', 'Por favor, insira um valor');
      return;
    }

    const parsedAmount = parsePrice(valor);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Erro', 'Por favor, insira um valor válido maior que zero');
      return;
    }

    if (!categoriaSelecionada) {
      Alert.alert('Erro', 'Por favor, selecione uma categoria');
      return;
    }

    if (!data.trim()) {
      Alert.alert('Erro', 'Por favor, insira uma data');
      return;
    }

    try {
      await addTransfer({
        description: descricao.trim(),
        amount: parsedAmount,
        type: tipo,
        categoryId: categoriaSelecionada,
        date: data.trim(),
        notes: observacoes.trim() || undefined,
      });

      // Go directly back to the list without confirmation message
      router.back();
    } catch (error) {
      Alert.alert('Erro', 'Falha ao criar transferência');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <ThemedView style={styles.header}>
        <ThemedText type='title'>Nova Transferência</ThemedText>
        <ThemedText type='subtitle'>Registre uma nova transação financeira</ThemedText>
      </ThemedView>

      <ThemedView style={styles.form}>
        <ThemedView style={styles.inputGroup}>
          <ThemedText type='defaultSemiBold'>Descrição</ThemedText>
          <TextInput
            style={styles.input}
            value={descricao}
            onChangeText={setDescricao}
            placeholder='Ex: Salário mensal'
            placeholderTextColor='#6c757d'
          />
        </ThemedView>

        <ThemedView style={styles.inputGroup}>
          <ThemedText type='defaultSemiBold'>Valor</ThemedText>
          <TextInput
            style={styles.input}
            value={valor}
            onChangeText={handlePriceChange}
            placeholder='0,00'
            placeholderTextColor='#6c757d'
            keyboardType='numeric'
          />
        </ThemedView>

        <ThemedView style={styles.inputGroup}>
          <ThemedText type='defaultSemiBold'>Tipo</ThemedText>
          <ThemedView style={styles.tipoContainer}>
            <TouchableOpacity style={styles.tipoRadio} onPress={() => setTipo(TransactionType.EXPENSE)}>
              <ThemedView style={[styles.radio, tipo === TransactionType.EXPENSE && styles.radioSelected]}>
                {tipo === TransactionType.EXPENSE && <ThemedView style={styles.radioDot} />}
              </ThemedView>
              <ThemedText style={styles.tipoLabel}>Despesa</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.tipoRadio} onPress={() => setTipo(TransactionType.INCOME)}>
              <ThemedView style={[styles.radio, tipo === TransactionType.INCOME && styles.radioSelected]}>
                {tipo === TransactionType.INCOME && <ThemedView style={styles.radioDot} />}
              </ThemedView>
              <ThemedText style={styles.tipoLabel}>Receita</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.inputGroup}>
          <ThemedText type='defaultSemiBold'>Categoria</ThemedText>
          <ThemedView style={styles.categoriasContainer}>
            {categoriasFiltradas.map((categoria) => (
              <TouchableOpacity
                key={categoria.id}
                style={[styles.categoriaButton, categoriaSelecionada === categoria.id && styles.categoriaButtonActive]}
                onPress={() => setCategoriaSelecionada(categoria.id)}
              >
                <ThemedText style={styles.categoriaIcone}>{categoria.icon}</ThemedText>
                <ThemedText
                  style={[styles.categoriaNome, categoriaSelecionada === categoria.id && styles.categoriaNomeActive]}
                >
                  {categoria.name}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ThemedView>
        </ThemedView>

        <DatePicker
          selectedDate={data}
          onDateSelect={setData}
          label='Data da Transferência'
          placeholder='Selecionar data'
        />

        <ThemedView style={styles.inputGroup}>
          <ThemedText type='defaultSemiBold'>Observações (opcional)</ThemedText>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={observacoes}
            onChangeText={setObservacoes}
            placeholder='Ex: Pagamento do aluguel do mês'
            placeholderTextColor='#6c757d'
            multiline
            numberOfLines={3}
            textAlignVertical='top'
          />
        </ThemedView>

        <ThemedView style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
            <ThemedText style={styles.cancelButtonText}>Cancelar</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSalvar}>
            <ThemedText style={styles.saveButtonText}>Salvar</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white', // Ensure main container has white background
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120, // Add extra bottom padding to ensure buttons are above tab bar
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
    backgroundColor: 'white', // Ensure header has white background
  },
  form: {
    flex: 1,
    gap: 25,
    backgroundColor: 'white', // Ensure form has white background
  },
  inputGroup: {
    gap: 10,
    backgroundColor: 'white', // Ensure input groups have white background
  },
  input: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: 'white', // Changed to white for consistency
  },
  textArea: {
    minHeight: 80,
    paddingTop: 15,
    paddingBottom: 15,
  },
  tipoContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  tipoRadio: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10, // Changed from 4 to 10 for a more rounded look
    borderWidth: 2,
    borderColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent', // Use transparent background
  },
  radioSelected: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'white',
  },
  tipoLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  categoriasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoriaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    backgroundColor: 'white', // Changed to white for consistency
    gap: 8,
  },
  categoriaButtonActive: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  categoriaIcone: {
    fontSize: 16,
  },
  categoriaNome: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoriaNomeActive: {
    color: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 20,
    marginBottom: 20, // Add bottom margin for extra spacing
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6c757d',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6c757d',
  },
  saveButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#007bff', // Changed from dynamic color to a consistent blue
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  noCategoriesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 20,
    minHeight: 400, // Ensure minimum height for proper centering
  },
  noCategoriesIcon: {
    fontSize: 64,
    marginBottom: 10,
  },
  noCategoriesTitle: {
    fontSize: 20,
    textAlign: 'center',
    color: '#6c757d',
  },
  noCategoriesMessage: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6c757d',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  createCategoryButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  createCategoryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

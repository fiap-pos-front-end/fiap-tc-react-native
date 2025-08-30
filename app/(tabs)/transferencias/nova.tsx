import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

const categorias = [
  { id: '1', nome: 'Moradia', tipo: 'despesa', icone: '🏠' },
  { id: '2', nome: 'Alimentação', tipo: 'despesa', icone: '🍽️' },
  { id: '3', nome: 'Transporte', tipo: 'despesa', icone: '🚗' },
  { id: '4', nome: 'Lazer', tipo: 'despesa', icone: '🎮' },
  { id: '5', nome: 'Salário', tipo: 'receita', icone: '💰' },
  { id: '6', nome: 'Freelance', tipo: 'receita', icone: '💼' },
  { id: '7', nome: 'Investimentos', tipo: 'receita', icone: '📈' },
];

export default function NovaTransferenciaScreen() {
  const router = useRouter();
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState<'receita' | 'despesa'>('despesa');
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [data, setData] = useState('');

  const categoriasFiltradas = categorias.filter(cat => cat.tipo === tipo);

  const handleSalvar = () => {
    if (!descricao.trim()) {
      Alert.alert('Erro', 'Por favor, insira uma descrição para a transferência');
      return;
    }

    if (!valor.trim() || isNaN(Number(valor))) {
      Alert.alert('Erro', 'Por favor, insira um valor válido');
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

    // Aqui você implementaria a lógica para salvar a transferência
    Alert.alert('Sucesso', 'Transferência criada com sucesso!', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Nova Transferência</ThemedText>
        <ThemedText type="subtitle">Registre uma nova transação financeira</ThemedText>
      </ThemedView>

      <ThemedView style={styles.form}>
        <ThemedView style={styles.inputGroup}>
          <ThemedText type="defaultSemiBold">Descrição</ThemedText>
          <TextInput
            style={styles.input}
            value={descricao}
            onChangeText={setDescricao}
            placeholder="Ex: Salário mensal"
            placeholderTextColor="#6c757d"
          />
        </ThemedView>

        <ThemedView style={styles.inputGroup}>
          <ThemedText type="defaultSemiBold">Valor</ThemedText>
          <TextInput
            style={styles.input}
            value={valor}
            onChangeText={setValor}
            placeholder="0,00"
            placeholderTextColor="#6c757d"
            keyboardType="numeric"
          />
        </ThemedView>

        <ThemedView style={styles.inputGroup}>
          <ThemedText type="defaultSemiBold">Tipo</ThemedText>
          <ThemedView style={styles.tipoContainer}>
            <TouchableOpacity
              style={styles.tipoRadio}
              onPress={() => setTipo('despesa')}
            >
              <ThemedView style={[
                styles.radio,
                tipo === 'despesa' && styles.radioSelected
              ]}>
                {tipo === 'despesa' && (
                  <ThemedView style={styles.radioDot} />
                )}
              </ThemedView>
              <ThemedText style={styles.tipoLabel}>Despesa</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tipoRadio}
              onPress={() => setTipo('receita')}
            >
              <ThemedView style={[
                styles.radio,
                tipo === 'receita' && styles.radioSelected
              ]}>
                {tipo === 'receita' && (
                  <ThemedView style={styles.radioDot} />
                )}
              </ThemedView>
              <ThemedText style={styles.tipoLabel}>Receita</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.inputGroup}>
          <ThemedText type="defaultSemiBold">Categoria</ThemedText>
          <ThemedView style={styles.categoriasContainer}>
            {categoriasFiltradas.map((categoria) => (
              <TouchableOpacity
                key={categoria.id}
                style={[
                  styles.categoriaButton,
                  categoriaSelecionada === categoria.id && styles.categoriaButtonActive
                ]}
                onPress={() => setCategoriaSelecionada(categoria.id)}
              >
                <ThemedText style={styles.categoriaIcone}>{categoria.icone}</ThemedText>
                <ThemedText style={[
                  styles.categoriaNome,
                  categoriaSelecionada === categoria.id && styles.categoriaNomeActive
                ]}>
                  {categoria.nome}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.inputGroup}>
          <ThemedText type="defaultSemiBold">Data</ThemedText>
          <TextInput
            style={styles.input}
            value={data}
            onChangeText={setData}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#6c757d"
          />
        </ThemedView>

        <ThemedView style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
          >
            <ThemedText style={styles.cancelButtonText}>Cancelar</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSalvar}
          >
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
    padding: 20,
    backgroundColor: 'white', // Ensure main container has white background
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
    paddingBottom: 30,
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
});

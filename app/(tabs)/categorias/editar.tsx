import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

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

export default function EditarCategoriaScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<'receita' | 'despesa'>('despesa');
  const [icone, setIcone] = useState('');

  useEffect(() => {
    if (id) {
      const categoria = categorias.find(cat => cat.id === id);
      if (categoria) {
        setNome(categoria.nome);
        setTipo(categoria.tipo as 'receita' | 'despesa');
        setIcone(categoria.icone);
      }
    }
  }, [id]);

  const handleSalvar = () => {
    if (!nome.trim()) {
      Alert.alert('Erro', 'Por favor, insira um nome para a categoria');
      return;
    }

    if (!icone.trim()) {
      Alert.alert('Erro', 'Por favor, insira um ícone para a categoria');
      return;
    }

    // Aqui você implementaria a lógica para atualizar a categoria
    Alert.alert('Sucesso', 'Categoria atualizada com sucesso!', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Editar Categoria</ThemedText>
        <ThemedText type="subtitle">Modifique os dados da categoria</ThemedText>
      </ThemedView>

      <ThemedView style={styles.form}>
        <ThemedView style={styles.inputGroup}>
          <ThemedText type="defaultSemiBold">Nome da Categoria</ThemedText>
          <TextInput
            style={styles.input}
            value={nome}
            onChangeText={setNome}
            placeholder="Ex: Alimentação"
            placeholderTextColor="#6c757d"
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
          <ThemedText type="defaultSemiBold">Ícone (emoji)</ThemedText>
          <TextInput
            style={styles.input}
            value={icone}
            onChangeText={setIcone}
            placeholder="Ex: 🍽️"
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
  form: {
    flex: 1,
    gap: 20, // Reduced from 25 to 20 for more compact spacing
  },
  inputGroup: {
    gap: 8, // Reduced from 10 to 8 for tighter field spacing
  },
  input: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: 'transparent', // Remove light gray background
    minHeight: 50, // Ensure minimum height for inputs
  },
  tipoContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  tipoRadio: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#dee2e6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#007bff', // Changed to a consistent blue color
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007bff', // Changed to a consistent blue color
  },
  tipoLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  iconePreview: {
    textAlign: 'center',
    fontSize: 24,
    marginTop: 15, // Increased margin for better spacing
    marginBottom: 10, // Add bottom margin
    minHeight: 40, // Ensure minimum height for icon preview
    paddingVertical: 10, // Add vertical padding
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
    backgroundColor: '#007bff', // Changed to a consistent blue color
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

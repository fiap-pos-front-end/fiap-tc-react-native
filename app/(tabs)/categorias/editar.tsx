import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { getRandomIcon } from '@/constants/Icons';
import { useCategories } from '@/contexts/CategoryContext';
import { Category, TransactionType } from '@/types';

export default function EditarCategoriaScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getCategoryById, updateCategory, loading } = useCategories();

  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<TransactionType>(TransactionType.EXPENSE);
  const [originalCategory, setOriginalCategory] = useState<Category | null>(null);

  useEffect(() => {
    if (id) {
      const categoria = getCategoryById(id);
      if (categoria) {
        setOriginalCategory(categoria);
        setNome(categoria.name);
        setTipo(categoria.type);
      }
    }
  }, [id, getCategoryById]);

  const handleSalvar = async () => {
    if (!nome.trim()) {
      Alert.alert('Erro', 'Por favor, insira um nome para a categoria');
      return;
    }

    if (!id) {
      Alert.alert('Erro', 'ID da categoria não encontrado');
      return;
    }

    try {
      // Only update the icon if the type has changed
      let iconToUse = originalCategory?.icon || '';
      if (originalCategory && tipo !== originalCategory.type) {
        // Type changed, assign a new random icon
        iconToUse = getRandomIcon(tipo);
      }

      const updatedCategory = {
        id,
        name: nome.trim(),
        type: tipo,
        icon: iconToUse,
      } as Category;

      await updateCategory(updatedCategory);
      // Go directly back to the list without confirmation message
      router.back();
    } catch (error) {
      Alert.alert('Erro', 'Falha ao atualizar categoria');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type='title'>Editar Categoria</ThemedText>
        <ThemedText type='subtitle'>Modifique os dados da categoria</ThemedText>
      </ThemedView>

      <ThemedView style={styles.form}>
        <ThemedView style={styles.inputGroup}>
          <ThemedText type='defaultSemiBold'>Nome da Categoria</ThemedText>
          <TextInput
            style={styles.input}
            value={nome}
            onChangeText={setNome}
            placeholder='Ex: Alimentação'
            placeholderTextColor='#6c757d'
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

        <ThemedView style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
            <ThemedText style={styles.cancelButtonText}>Cancelar</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSalvar}>
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

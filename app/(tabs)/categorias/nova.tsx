import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { getRandomIcon } from '@/constants/Icons';
import { useCategories } from '@/contexts/CategoryContext';

export default function NovaCategoriaScreen() {
  const router = useRouter();
  const { addCategory } = useCategories();
  const [nome, setNome] = useState('');

  const handleSalvar = async () => {
    if (!nome.trim()) {
      Alert.alert('Erro', 'Por favor, insira um nome para a categoria');
      return;
    }

    try {
      // Automatically assign a random icon
      const randomIcon = getRandomIcon();

      await addCategory({
        name: nome.trim(),
        icon: randomIcon,
      });

      // Go directly back to the list without confirmation message
      router.back();
    } catch {
      Alert.alert('Error', 'Falha ao criar categoria');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type='title'>Nova Categoria</ThemedText>
        <ThemedText type='subtitle'>Crie uma nova categoria financeira</ThemedText>
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
    gap: 25,
  },
  inputGroup: {
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
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
    borderRadius: 12, // Half of width/height for a circle
    borderWidth: 2,
    borderColor: '#6c757d',
    justifyContent: 'center',
    alignItems: 'center',
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

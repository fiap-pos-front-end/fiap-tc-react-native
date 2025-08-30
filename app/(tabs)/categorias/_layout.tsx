import { Stack } from 'expo-router';

export default function CategoriasLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Categorias',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="detalhes"
        options={{
          title: 'Detalhes da Categoria',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="nova"
        options={{
          title: 'Nova Categoria',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="editar"
        options={{
          title: 'Editar Categoria',
          headerShown: true,
        }}
      />
    </Stack>
  );
}

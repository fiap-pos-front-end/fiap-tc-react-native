import { Stack } from 'expo-router';

export default function TransferenciasLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Transferências',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="nova"
        options={{
          title: 'Nova Transferência',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="detalhes"
        options={{
          title: 'Detalhes da Transferência',
          headerShown: true,
        }}
      />
    </Stack>
  );
}

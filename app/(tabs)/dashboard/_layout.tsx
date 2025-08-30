import { Stack } from 'expo-router';

export default function DashboardLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Dashboard',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="details"
        options={{
          title: 'Detalhes',
          headerShown: true,
        }}
      />
    </Stack>
  );
}

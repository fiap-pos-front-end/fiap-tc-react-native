import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#fff",
        },
        headerTintColor: "#007bff",
        headerTitleStyle: {
          fontWeight: "600",
          fontSize: 18,
        },
        headerShadowVisible: true,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Perfil",
        }}
      />
    </Stack>
  );
}

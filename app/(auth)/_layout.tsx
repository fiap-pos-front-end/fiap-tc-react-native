import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
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
        name="login"
        options={{
          title: "Login",
        }}
      />
      <Stack.Screen
        name="signup"
        options={{
          title: "Criar Conta",
        }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{
          title: "Recuperar Senha",
        }}
      />
    </Stack>
  );
}

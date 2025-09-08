import { ThemedText } from "@/components/ThemedText";
import { Stack, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";

export default function CategoriesLayout() {
  const router = useRouter();

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
          title: "Categorias",
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push("/categories/add")}>
              <ThemedText
                style={{
                  color: "#007bff",
                  fontSize: 30,
                  fontWeight: "300",
                }}
              >
                +
              </ThemedText>
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="add"
        options={{
          title: "Nova Categoria",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="[id]/edit"
        options={{
          title: "Editar Categoria",
        }}
      />
      <Stack.Screen
        name="[id]/view"
        options={{
          title: "Detalhes da Categoria",
        }}
      />
    </Stack>
  );
}

import { Link, Stack } from "expo-router";
import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          Essa página não existe.
        </ThemedText>
        <Link href="/(tabs)/dashboard" style={styles.link}>
          <ThemedText type="link">Ir para a página inicial!</ThemedText>
        </Link>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    textAlign: "center",
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});

import { useAuthContext } from "@/contexts/AuthContext";
import { Redirect } from "expo-router";
import React from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { user, initializing, loading } = useAuthContext();

  if (initializing || loading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color="#007bff" />
        <ThemedText style={styles.loadingText}>
          Verificando autenticação...
        </ThemedText>
      </ThemedView>
    );
  }

  if (!user) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <Redirect href="/(auth)/login" />;
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
});

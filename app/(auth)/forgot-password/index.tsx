import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useAuthContext } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resetPassword } = useAuthContext();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert("Erro", "Por favor, insira seu email");
      return;
    }

    setLoading(true);
    const result = await resetPassword(email.trim());
    setLoading(false);

    if (result.success) {
      Alert.alert(
        "Email Enviado!",
        "Enviamos um link para redefinir sua senha. Verifique sua caixa de entrada.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      Alert.alert(
        "Erro",
        result.error || "Falha ao enviar email de recuperação"
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ThemedView style={styles.content}>
          <ThemedView style={styles.form}>
            <ThemedView style={styles.inputGroup}>
              <ThemedText style={styles.label}>Email</ThemedText>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="seu@email.com"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!loading}
              />
            </ThemedView>

            <TouchableOpacity
              style={[styles.resetButton, loading && styles.disabledButton]}
              onPress={handleResetPassword}
              disabled={loading}
            >
              <ThemedText style={styles.resetButtonText}>
                {loading ? "Enviando..." : "Enviar Link de Recuperação"}
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>

          <ThemedView style={styles.footer}>
            <ThemedText style={styles.footerText}>
              Lembrou da senha?{" "}
            </ThemedText>
            <TouchableOpacity onPress={() => router.back()}>
              <ThemedText style={styles.footerLink}>Fazer login</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 24,
    zIndex: 1,
  },
  backButtonText: {
    color: "#007bff",
    fontSize: 16,
    fontWeight: "500",
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
    marginTop: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
  form: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    color: "#333",
  },
  resetButton: {
    backgroundColor: "#007bff",
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  resetButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    color: "#666",
    fontSize: 16,
  },
  footerLink: {
    color: "#007bff",
    fontSize: 16,
    fontWeight: "600",
  },
});

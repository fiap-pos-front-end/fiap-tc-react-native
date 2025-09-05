import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useAuthContext } from "@/contexts/AuthContext";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, loading } = useAuthContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert("Erro", "Por favor, insira seu email");
      return;
    }

    if (!password.trim()) {
      Alert.alert("Erro", "Por favor, insira sua senha");
      return;
    }

    const result = await signIn(email.trim(), password);

    if (result.success) {
      router.replace("/(tabs)/dashboard");
    } else {
      Alert.alert("Erro no Login", result.error || "Falha ao fazer login");
    }
  };

  const navigateToSignUp = () => {
    router.push("/(auth)/signup");
  };

  const navigateToForgotPassword = () => {
    router.push("/(auth)/forgot-password");
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <ThemedView style={styles.content}>
            <ThemedView style={styles.header}>
              <ThemedText style={styles.title}>Bem-vindo de volta!</ThemedText>
              <ThemedText style={styles.subtitle}>
                Faça login para continuar
              </ThemedText>
            </ThemedView>

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

              <ThemedView style={styles.inputGroup}>
                <ThemedText style={styles.label}>Senha</ThemedText>
                <ThemedView style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Sua senha"
                    placeholderTextColor="#999"
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                    editable={!loading}
                  />
                  <TouchableOpacity
                    style={styles.showPasswordButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <ThemedText style={styles.showPasswordText}>
                      {showPassword ? (
                        <FontAwesome name="eye-slash" size={24} color="black" />
                      ) : (
                        <FontAwesome name="eye" size={24} color="black" />
                      )}
                    </ThemedText>
                  </TouchableOpacity>
                </ThemedView>
              </ThemedView>

              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={navigateToForgotPassword}
              >
                <ThemedText style={styles.forgotPasswordText}>
                  Esqueceu sua senha?
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.loginButton, loading && styles.disabledButton]}
                onPress={handleLogin}
                disabled={loading}
              >
                <ThemedText style={styles.loginButtonText}>
                  {loading ? "Entrando..." : "Entrar"}
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>

            <ThemedView style={styles.footer}>
              <ThemedText style={styles.footerText}>
                Não tem uma conta?{" "}
              </ThemedText>
              <TouchableOpacity onPress={navigateToSignUp}>
                <ThemedText style={styles.footerLink}>Criar conta</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  form: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
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
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: "#333",
  },
  showPasswordButton: {
    padding: 16,
  },
  showPasswordText: {
    fontSize: 18,
  },
  forgotPassword: {
    alignItems: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: "#007bff",
    fontSize: 14,
    fontWeight: "500",
  },
  loginButton: {
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
  loginButtonText: {
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

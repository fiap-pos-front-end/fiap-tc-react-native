import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useAuthContext } from "@/contexts/AuthContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateDisplayName, updatePassword } = useAuthContext();

  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!displayName.trim()) {
      newErrors.displayName = "Nome é obrigatório";
    }

    if (newPassword) {
      if (!currentPassword) {
        newErrors.currentPassword = "Senha atual é obrigatória";
      }
      if (newPassword.length < 6) {
        newErrors.newPassword = "Nova senha deve ter pelo menos 6 caracteres";
      }
      if (newPassword !== confirmPassword) {
        newErrors.confirmPassword = "Senhas não coincidem";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearFieldError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Atualizar nome se mudou
      if (displayName.trim() !== user?.displayName) {
        const nameResult = await updateDisplayName(displayName.trim());
        if (!nameResult.success) {
          Alert.alert("Erro", nameResult.error || "Falha ao atualizar nome");
          return;
        }
      }

      // Atualizar senha se fornecida
      if (newPassword) {
        const passwordResult = await updatePassword(
          currentPassword,
          newPassword
        );
        if (!passwordResult.success) {
          Alert.alert("Erro", passwordResult.error || "Falha ao alterar senha");
          return;
        }
      }

      Alert.alert("Sucesso", "Perfil atualizado com sucesso!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert("Erro", "Falha ao atualizar perfil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <ThemedView style={styles.content}>
            {/* Header customizado removido */}

            {/* Email (readonly) */}
            <ThemedView style={styles.field}>
              <ThemedText style={styles.label}>Email</ThemedText>
              <ThemedView style={styles.readOnlyInput}>
                <ThemedText style={styles.readOnlyText}>
                  {user?.email}
                </ThemedText>
                <MaterialCommunityIcons name="lock" size={16} color="#999" />
              </ThemedView>
              <ThemedText style={styles.helperText}>
                O email não pode ser alterado
              </ThemedText>
            </ThemedView>

            {/* Nome */}
            <ThemedView style={styles.field}>
              <ThemedText style={styles.label}>Nome</ThemedText>
              <TextInput
                style={[styles.input, errors.displayName && styles.inputError]}
                value={displayName}
                onChangeText={(text) => {
                  setDisplayName(text);
                  clearFieldError("displayName");
                }}
                placeholder="Digite seu nome"
                placeholderTextColor="#999"
                editable={!loading}
              />
              {errors.displayName && (
                <ThemedText style={styles.error}>
                  {errors.displayName}
                </ThemedText>
              )}
            </ThemedView>

            {/* Divisor */}
            <ThemedView style={styles.divider}>
              <ThemedText style={styles.dividerText}>
                Alterar Senha (opcional)
              </ThemedText>
            </ThemedView>

            {/* Senha Atual */}
            <ThemedView style={styles.field}>
              <ThemedText style={styles.label}>Senha Atual</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  errors.currentPassword && styles.inputError,
                ]}
                value={currentPassword}
                onChangeText={(text) => {
                  setCurrentPassword(text);
                  clearFieldError("currentPassword");
                }}
                placeholder="Digite sua senha atual"
                placeholderTextColor="#999"
                secureTextEntry
                editable={!loading}
              />
              {errors.currentPassword && (
                <ThemedText style={styles.error}>
                  {errors.currentPassword}
                </ThemedText>
              )}
            </ThemedView>

            {/* Nova Senha */}
            <ThemedView style={styles.field}>
              <ThemedText style={styles.label}>Nova Senha</ThemedText>
              <TextInput
                style={[styles.input, errors.newPassword && styles.inputError]}
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  clearFieldError("newPassword");
                }}
                placeholder="Digite a nova senha"
                placeholderTextColor="#999"
                secureTextEntry
                editable={!loading}
              />
              {errors.newPassword && (
                <ThemedText style={styles.error}>
                  {errors.newPassword}
                </ThemedText>
              )}
              <ThemedText style={styles.helperText}>
                Mínimo 6 caracteres
              </ThemedText>
            </ThemedView>

            {/* Confirmar Senha */}
            <ThemedView style={styles.field}>
              <ThemedText style={styles.label}>Confirmar Nova Senha</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  errors.confirmPassword && styles.inputError,
                ]}
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  clearFieldError("confirmPassword");
                }}
                placeholder="Confirme a nova senha"
                placeholderTextColor="#999"
                secureTextEntry
                editable={!loading}
              />
              {errors.confirmPassword && (
                <ThemedText style={styles.error}>
                  {errors.confirmPassword}
                </ThemedText>
              )}
            </ThemedView>

            {/* Botões */}
            <ThemedView style={styles.actions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => router.back()}
                disabled={loading}
              >
                <ThemedText style={styles.cancelTxt}>Cancelar</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveBtn, loading && styles.disabled]}
                onPress={handleSave}
                disabled={loading}
              >
                {loading && <ActivityIndicator size="small" color="#fff" />}
                <ThemedText style={styles.saveTxt}>
                  {loading ? "Salvando" : "Salvar"}
                </ThemedText>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 16,
    gap: 16,
    minHeight: "100%",
  },
  // Header styles removidos
  field: {
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    backgroundColor: "#fff",
    color: "#333",
  },
  inputError: {
    borderColor: "#dc3545",
  },
  readOnlyInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 10,
    backgroundColor: "#f8f9fa",
  },
  readOnlyText: {
    fontSize: 14,
    color: "#666",
  },
  error: {
    fontSize: 11,
    color: "#dc3545",
    marginTop: 2,
  },
  helperText: {
    fontSize: 11,
    color: "#666",
    marginTop: 2,
  },
  divider: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    marginTop: 8,
  },
  dividerText: {
    fontSize: 12,
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  cancelBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#999",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  saveBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    padding: 10,
    borderRadius: 6,
    backgroundColor: "#007bff",
  },
  disabled: {
    opacity: 0.6,
  },
  cancelTxt: {
    fontSize: 13,
    fontWeight: "500",
    color: "#666",
  },
  saveTxt: {
    fontSize: 13,
    fontWeight: "500",
    color: "#fff",
  },
});

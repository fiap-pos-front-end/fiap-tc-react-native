import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useAuthContext } from "@/contexts/AuthContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

export default function ProfileScreen() {
  const router = useRouter();
  const {
    user,
    signOut,
    loading,
    sendEmailVerification,
    checkEmailVerification,
    verificationLoading,
  } = useAuthContext();

  const [isCheckingVerification, setIsCheckingVerification] = useState(false);

  const handleSignOut = () => {
    Alert.alert("Sair", "Deseja sair da conta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          const result = await signOut();
          if (result.success) {
            router.replace("/(auth)/login");
          } else {
            Alert.alert("Erro", "Falha ao sair da conta");
          }
        },
      },
    ]);
  };

  const handleEdit = () => {
    router.push(`/profile/edit`);
  };
  const handleSendVerification = async () => {
    const result = await sendEmailVerification();

    if (result.success) {
      Alert.alert(
        "Email Enviado",
        "Verifique sua caixa de entrada e clique no link de verificação. Depois, toque em 'Verificar Status' para atualizar.",
        [{ text: "OK" }]
      );
    } else {
      Alert.alert(
        "Erro",
        result.message || "Falha ao enviar email de verificação"
      );
    }
  };

  const handleCheckVerification = async () => {
    setIsCheckingVerification(true);

    const result = await checkEmailVerification();

    setIsCheckingVerification(false);

    if (result.success) {
      if (result.isVerified) {
        Alert.alert("Sucesso", "Email verificado com sucesso!");
      } else {
        Alert.alert(
          "Aviso",
          "Email ainda não foi verificado. Verifique sua caixa de entrada."
        );
      }
    } else {
      Alert.alert("Erro", result.message || "Falha ao verificar status");
    }
  };

  const getInitials = () => {
    if (user?.displayName) {
      return user.displayName
        .split(" ")
        .map((name) => name[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return (user?.email || "?")[0].toUpperCase();
  };

  const isLoadingAny = loading || verificationLoading || isCheckingVerification;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <ThemedView style={styles.header}>
          <ThemedView style={styles.avatar}>
            <ThemedText style={styles.avatarText}>{getInitials()}</ThemedText>
          </ThemedView>
          <ThemedText style={styles.name}>
            {user?.displayName || "Usuário"}
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.info}>
          {user?.displayName && (
            <ThemedView style={styles.row}>
              <ThemedText style={styles.label}>Nome</ThemedText>
              <ThemedText style={styles.value}>{user.displayName}</ThemedText>
            </ThemedView>
          )}

          <ThemedView style={styles.row}>
            <ThemedText style={styles.label}>Email</ThemedText>
            <ThemedText style={styles.value}>{user?.email}</ThemedText>
          </ThemedView>

          <ThemedView style={styles.row}>
            <ThemedText style={styles.label}>Status</ThemedText>
            <ThemedView style={styles.statusContainer}>
              <MaterialCommunityIcons
                name={user?.emailVerified ? "check-circle" : "alert-circle"}
                size={14}
                color={user?.emailVerified ? "#28a745" : "#ffc107"}
              />
              <ThemedText
                style={[
                  styles.status,
                  user?.emailVerified ? styles.verified : styles.unverified,
                ]}
              >
                {user?.emailVerified ? "Verificado" : "Não verificado"}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.actions}>
          {!user?.emailVerified && (
            <>
              <TouchableOpacity
                style={styles.verifyBtn}
                onPress={handleSendVerification}
                disabled={isLoadingAny}
              >
                {verificationLoading ? (
                  <ActivityIndicator size="small" color="#ffc107" />
                ) : (
                  <MaterialCommunityIcons
                    name="email-send"
                    size={16}
                    color="#ffc107"
                  />
                )}
                <ThemedText style={styles.verifyText}>
                  {verificationLoading ? "Enviando..." : "Enviar Verificação"}
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.checkBtn}
                onPress={handleCheckVerification}
                disabled={isLoadingAny}
              >
                {isCheckingVerification ? (
                  <ActivityIndicator size="small" color="#007bff" />
                ) : (
                  <MaterialCommunityIcons
                    name="refresh"
                    size={16}
                    color="#007bff"
                  />
                )}
                <ThemedText style={styles.checkText}>
                  {isCheckingVerification
                    ? "Verificando..."
                    : "Verificar Status"}
                </ThemedText>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity
            style={styles.editProfileBtn}
            onPress={handleEdit}
            disabled={loading}
          >
            <MaterialCommunityIcons name="pencil" size={16} color="#007bff" />
            <ThemedText style={styles.editProfileText}>Editar</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signOutBtn}
            onPress={handleSignOut}
            disabled={isLoadingAny}
          >
            <MaterialCommunityIcons name="logout" size={16} color="#dc3545" />
            <ThemedText style={styles.signOutText}>Sair da Conta</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  header: {
    alignItems: "center",
    padding: 20,
    gap: 12,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  info: {
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  value: {
    fontSize: 13,
    color: "#333",
    fontWeight: "500",
    textAlign: "right",
    flex: 1,
    marginLeft: 16,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
    justifyContent: "flex-end",
  },
  status: {
    fontSize: 13,
    fontWeight: "500",
  },
  verified: {
    color: "#28a745",
  },
  unverified: {
    color: "#ffc107",
  },
  actions: {
    gap: 12,
  },
  editProfileBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#007bff",
  },
  editProfileText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#007bff",
  },
  verifyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ffc107",
  },
  verifyText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#ffc107",
  },
  checkBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#007bff",
  },
  checkText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#007bff",
  },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#dc3545",
  },
  signOutText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#dc3545",
  },
});

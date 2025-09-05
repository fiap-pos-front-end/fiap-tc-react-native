import { FirestoreService } from "@/services/firestore";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { useEffect, useState } from "react";

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);
  const [verificationLoading, setVerificationLoading] = useState(false);

  const firestoreService = new FirestoreService();

  const clearAppCache = async () => {
    try {
      firestoreService.disconnectAllListeners();

      if (global.gc) {
        global.gc();
      }
    } catch (error) {
      console.error("❌ Erro ao limpar cache:", error);
    }
  };

  function onAuthStateChanged(user: FirebaseAuthTypes.User | null) {
    const previousUser = user;

    if (user) {
      setUser({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified,
      });
    } else {
      const hadUser = !!previousUser;

      setUser(null);

      if (hadUser) {
        clearAppCache();
      }
    }

    if (initializing) setInitializing(false);
    setLoading(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, [initializing]);

  const signUp = async (
    email: string,
    password: string,
    displayName?: string
  ) => {
    setLoading(true);
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(
        email,
        password
      );

      if (displayName && userCredential.user) {
        await userCredential.user.updateProfile({
          displayName: displayName,
        });
      }

      return { success: true, user: userCredential.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      firestoreService.disconnectAllListeners();

      const userCredential = await auth().signInWithEmailAndPassword(
        email,
        password
      );
      return { success: true, user: userCredential.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const currentUserId = user?.uid;

      if (currentUserId) {
        firestoreService.disconnectUserListeners(currentUserId);
      }

      await clearAppCache();

      await auth().signOut();

      return { success: true };
    } catch (error: any) {
      console.error("❌ Erro no logout:", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await auth().sendPasswordResetEmail(email);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const sendEmailVerification = async (): Promise<{
    success: boolean;
    message?: string;
  }> => {
    setVerificationLoading(true);

    try {
      const currentUser = auth().currentUser;

      if (!currentUser) {
        return {
          success: false,
          message: "Usuário não encontrado",
        };
      }

      if (currentUser.emailVerified) {
        return {
          success: false,
          message: "Email já está verificado",
        };
      }

      await currentUser.sendEmailVerification();

      return {
        success: true,
        message: "Email de verificação enviado!",
      };
    } catch (error: any) {
      console.error("Erro ao enviar verificação:", error);

      let message = "Erro ao enviar email de verificação";

      switch (error.code) {
        case "auth/too-many-requests":
          message = "Muitas tentativas. Tente novamente mais tarde.";
          break;
        case "auth/user-disabled":
          message = "Conta desabilitada";
          break;
        case "auth/user-not-found":
          message = "Usuário não encontrado";
          break;
        case "auth/unauthorized-domain":
          message =
            "Domínio não autorizado. Configuração necessária no Firebase.";
          break;
        default:
          message = error.message || "Erro desconhecido";
      }

      return {
        success: false,
        message,
      };
    } finally {
      setVerificationLoading(false);
    }
  };

  const checkEmailVerification = async (): Promise<{
    success: boolean;
    isVerified: boolean;
    message?: string;
  }> => {
    try {
      const currentUser = auth().currentUser;

      if (!currentUser) {
        return {
          success: false,
          isVerified: false,
          message: "Usuário não encontrado",
        };
      }

      await currentUser.reload();

      setUser({
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName,
        emailVerified: currentUser.emailVerified,
      });

      return {
        success: true,
        isVerified: currentUser.emailVerified,
        message: currentUser.emailVerified
          ? "Email verificado com sucesso!"
          : "Email ainda não foi verificado",
      };
    } catch (error: any) {
      console.error("Erro ao verificar status:", error);

      return {
        success: false,
        isVerified: false,
        message: "Erro ao verificar status do email",
      };
    }
  };

  const updatePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    try {
      const currentUser = auth().currentUser;

      if (!currentUser || !currentUser.email) {
        return { success: false, error: "Usuário não encontrado" };
      }

      const credential = auth.EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );

      await currentUser.reauthenticateWithCredential(credential);

      await currentUser.updatePassword(newPassword);

      return { success: true };
    } catch (error: any) {
      let message = "Erro ao alterar senha";

      switch (error.code) {
        case "auth/wrong-password":
          message = "Senha atual incorreta";
          break;
        case "auth/weak-password":
          message = "Nova senha muito fraca";
          break;
        case "auth/requires-recent-login":
          message = "É necessário fazer login novamente";
          break;
        default:
          message = error.message || "Erro desconhecido";
      }

      return { success: false, error: message };
    }
  };

  const updateDisplayName = async (newDisplayName: string) => {
    try {
      const currentUser = auth().currentUser;

      if (!currentUser) {
        return { success: false, error: "Usuário não encontrado" };
      }

      await currentUser.updateProfile({
        displayName: newDisplayName.trim(),
      });

      setUser((prev) =>
        prev
          ? {
              ...prev,
              displayName: newDisplayName.trim(),
            }
          : null
      );

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  return {
    user,
    loading,
    initializing,
    verificationLoading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    sendEmailVerification,
    checkEmailVerification,
    updatePassword,
    updateDisplayName,
    isAuthenticated: !!user,
    clearAppCache,
  };
}

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

  const sendEmailVerification = async () => {
    try {
      const currentUser = auth().currentUser;
      if (currentUser) {
        await currentUser.sendEmailVerification();
        return { success: true };
      }
      return { success: false, error: "No user logged in" };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const updateProfile = async (updates: {
    displayName?: string;
    photoURL?: string;
  }) => {
    try {
      const currentUser = auth().currentUser;
      if (currentUser) {
        await currentUser.updateProfile(updates);
        return { success: true };
      }
      return { success: false, error: "No user logged in" };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  return {
    user,
    loading,
    initializing,
    signUp,
    signIn,
    signOut,
    resetPassword,
    sendEmailVerification,
    updateProfile,
    isAuthenticated: !!user,
    clearAppCache,
  };
}

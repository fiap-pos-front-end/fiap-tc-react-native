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

  function onAuthStateChanged(user: FirebaseAuthTypes.User | null) {
    if (user) {
      setUser({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified,
      });
    } else {
      setUser(null);
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
      await auth().signOut();
      return { success: true };
    } catch (error: any) {
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
  };
}

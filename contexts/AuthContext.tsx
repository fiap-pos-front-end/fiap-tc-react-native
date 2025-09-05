import { AuthUser, useAuth } from "@/hooks/firebase/useAuth";
import React, { createContext, ReactNode, useContext } from "react";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  initializing: boolean;
  verificationLoading: boolean;
  signUp: (
    email: string,
    password: string,
    displayName?: string
  ) => Promise<{ success: boolean; user?: any; error?: string }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; user?: any; error?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  resetPassword: (
    email: string
  ) => Promise<{ success: boolean; error?: string }>;
  sendEmailVerification: () => Promise<{
    success: boolean;
    message?: string;
  }>;
  checkEmailVerification: () => Promise<{
    success: boolean;
    isVerified: boolean;
    message?: string;
  }>;
  updatePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<{ success: boolean; error?: string }>;
  updateDisplayName: (
    newDisplayName: string
  ) => Promise<{ success: boolean; error?: string }>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const authData = useAuth();

  return (
    <AuthContext.Provider value={authData}>{children}</AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}

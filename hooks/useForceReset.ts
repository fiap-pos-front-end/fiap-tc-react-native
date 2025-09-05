import { FirestoreService } from "@/services/firestore";
import { useCallback } from "react";

export function useForceReset() {
  const firestoreService = new FirestoreService();
  const forceCompleteReset = useCallback(async () => {
    try {
      firestoreService.disconnectAllListeners();

      await new Promise((resolve) => setTimeout(resolve, 500));

      if (global.gc) {
        global.gc();
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));

      return true;
    } catch (error) {
      console.error("❌ Erro no reset forçado:", error);
      return false;
    }
  }, []);

  const forceUserReset = useCallback(async (userId: string) => {
    try {
      firestoreService.disconnectUserListeners(userId);

      await new Promise((resolve) => setTimeout(resolve, 500));

      return true;
    } catch (error) {
      console.error("❌ Erro no reset do usuário:", error);
      return false;
    }
  }, []);

  return {
    forceCompleteReset,
    forceUserReset,
  };
}

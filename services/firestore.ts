import auth from "@react-native-firebase/auth";
import firestore, {
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";

export class FirestoreService {
  private db = firestore();

  private activeListeners = new Map<string, () => void>();

  private getCurrentUserId(): string | null {
    return auth().currentUser?.uid || null;
  }

  private requireAuth(): string {
    const userId = this.getCurrentUserId();
    if (!userId) {
      throw new Error("User not authenticated");
    }
    return userId;
  }

  public disconnectAllListeners(): void {
    this.activeListeners.forEach((unsubscribe, key) => {
      try {
        unsubscribe();
      } catch (error) {
        console.error(`❌ Erro ao desconectar listener ${key}:`, error);
      }
    });

    this.activeListeners.clear();
  }

  public disconnectUserListeners(userId: string): void {
    const userListeners = Array.from(this.activeListeners.keys()).filter(
      (key) => key.includes(userId)
    );

    userListeners.forEach((key) => {
      const unsubscribe = this.activeListeners.get(key);
      if (unsubscribe) {
        unsubscribe();
        this.activeListeners.delete(key);
      }
    });
  }

  async addDocument<T extends Record<string, any>>(
    collection: string,
    data: Omit<T, "id" | "userId">
  ): Promise<string> {
    try {
      const userId = this.requireAuth();
      const docRef = await this.db.collection(collection).add({
        ...data,
        userId,
        created: firestore.FieldValue.serverTimestamp(),
        updated: firestore.FieldValue.serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error adding document:", error);
      throw error;
    }
  }

  async getDocument<T>(collection: string, id: string): Promise<T | null> {
    try {
      const userId = this.requireAuth();
      const doc = await this.db.collection(collection).doc(id).get();
      if (doc.exists()) {
        const data = doc.data();
        if (data?.userId === userId) {
          return { id: doc.id, ...data } as T;
        }
      }
      return null;
    } catch (error) {
      console.error("Error getting document:", error);
      throw error;
    }
  }

  async getCollection<T>(
    collection: string,
    orderBy?: string,
    limit?: number
  ): Promise<T[]> {
    try {
      const userId = this.requireAuth();
      let query = this.db.collection(collection).where("userId", "==", userId);

      if (orderBy) {
        try {
          query = query.orderBy(orderBy, "desc") as any;
        } catch (indexError) {
          console.warn(
            `Index not available for orderBy ${orderBy}, fetching without ordering`
          );
        }
      }

      if (limit) {
        query = query.limit(limit) as any;
      }

      const snapshot = await query.get();
      let results = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];

      if (orderBy && results.length > 0) {
        results = results.sort((a: any, b: any) => {
          const aValue = a[orderBy];
          const bValue = b[orderBy];

          if (typeof aValue === "string" && typeof bValue === "string") {
            return aValue.localeCompare(bValue);
          }

          if (aValue < bValue) return -1;
          if (aValue > bValue) return 1;
          return 0;
        });
      }

      return results;
    } catch (error) {
      console.error("Error getting collection:", error);
      throw error;
    }
  }

  async updateDocument<T extends Record<string, any>>(
    collection: string,
    id: string,
    data: Partial<T>
  ): Promise<void> {
    try {
      const userId = this.requireAuth();
      const doc = await this.db.collection(collection).doc(id).get();
      if (!doc.exists() || doc.data()?.userId !== userId) {
        throw new Error("Document not found or access denied");
      }

      await this.db
        .collection(collection)
        .doc(id)
        .update({
          ...data,
          updated: firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
      console.error("Error updating document:", error);
      throw error;
    }
  }

  async deleteDocument(collection: string, id: string): Promise<void> {
    try {
      const userId = this.requireAuth();
      const doc = await this.db.collection(collection).doc(id).get();
      if (!doc.exists() || doc.data()?.userId !== userId) {
        throw new Error("Document not found or access denied");
      }

      await this.db.collection(collection).doc(id).delete();
    } catch (error) {
      console.error("Error deleting document:", error);
      throw error;
    }
  }

  onDocumentSnapshot<T>(
    collection: string,
    id: string,
    callback: (data: T | null) => void
  ): () => void {
    const userId = this.getCurrentUserId();

    if (!userId) {
      callback(null);
      return () => {};
    }

    const listenerKey = `doc_${collection}_${id}_${userId}`;

    const existingListener = this.activeListeners.get(listenerKey);
    if (existingListener) {
      existingListener();
    }

    const unsubscribe = this.db
      .collection(collection)
      .doc(id)
      .onSnapshot(
        (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            if (data?.userId === userId) {
              callback({ id: doc.id, ...data } as T);
            } else {
              callback(null);
            }
          } else {
            callback(null);
          }
        },
        (error) => {
          console.error("Document snapshot error:", error);
          callback(null);
        }
      );

    this.activeListeners.set(listenerKey, unsubscribe);

    return () => {
      unsubscribe();
      this.activeListeners.delete(listenerKey);
    };
  }

  onCollectionSnapshot<T>(
    collection: string,
    callback: (data: T[]) => void,
    orderBy?: string
  ): () => void {
    const userId = this.getCurrentUserId();

    if (!userId) {
      callback([]);
      return () => {};
    }

    const listenerKey = `collection_${collection}_${userId}_${
      orderBy || "no-order"
    }`;

    const existingListener = this.activeListeners.get(listenerKey);
    if (existingListener) {
      existingListener();
    }

    let query = this.db.collection(collection).where("userId", "==", userId);

    let hasOrdering = false;
    if (orderBy) {
      try {
        query = query.orderBy(orderBy, "desc") as any;
        hasOrdering = true;
      } catch (error) {
        console.warn(
          `Could not add orderBy ${orderBy} to real-time query, will sort in memory`
        );
        hasOrdering = false;
      }
    }

    const unsubscribe = query.onSnapshot(
      (snapshot) => {
        let data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];

        if (orderBy && !hasOrdering && data.length > 0) {
          data = data.sort((a: any, b: any) => {
            const aValue = a[orderBy];
            const bValue = b[orderBy];

            if (typeof aValue === "string" && typeof bValue === "string") {
              return aValue.localeCompare(bValue);
            }

            if (aValue < bValue) return -1;
            if (aValue > bValue) return 1;
            return 0;
          });
        }

        callback(data);
      },
      (error: any) => {
        console.error("Collection snapshot error:", error);

        if (error.code === "failed-precondition" && orderBy) {
          const simpleQuery = this.db
            .collection(collection)
            .where("userId", "==", userId);

          return simpleQuery.onSnapshot(
            (snapshot) => {
              let data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              })) as T[];

              if (orderBy && data.length > 0) {
                data = data.sort((a: any, b: any) => {
                  const aValue = a[orderBy];
                  const bValue = b[orderBy];

                  if (
                    typeof aValue === "string" &&
                    typeof bValue === "string"
                  ) {
                    return aValue.localeCompare(bValue);
                  }

                  if (aValue < bValue) return -1;
                  if (aValue > bValue) return 1;
                  return 0;
                });
              }

              callback(data);
            },
            (retryError) => {
              console.error("Retry also failed:", retryError);
              callback([]);
            }
          );
        } else {
          callback([]);
        }
      }
    );

    this.activeListeners.set(listenerKey, unsubscribe);

    return () => {
      unsubscribe();
      this.activeListeners.delete(listenerKey);
    };
  }

  async queryCollection<T>(
    collection: string,
    field: string,
    operator: FirebaseFirestoreTypes.WhereFilterOp,
    value: any
  ): Promise<T[]> {
    try {
      const userId = this.requireAuth();
      const snapshot = await this.db
        .collection(collection)
        .where("userId", "==", userId)
        .where(field, operator, value)
        .get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
    } catch (error) {
      console.error("Error querying collection:", error);
      throw error;
    }
  }

  isAuthenticated(): boolean {
    return !!this.getCurrentUserId();
  }

  getCurrentUser(): string | null {
    return this.getCurrentUserId();
  }
}

export const firestoreService = new FirestoreService();

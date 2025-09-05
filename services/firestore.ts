import auth from "@react-native-firebase/auth";
import firestore, {
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";

export class FirestoreService {
  private db = firestore();

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
        query = query.orderBy(orderBy, "desc") as any;
      }

      if (limit) {
        query = query.limit(limit) as any;
      }

      const snapshot = await query.get();
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
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

    return this.db
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

    let query = this.db.collection(collection).where("userId", "==", userId);

    if (orderBy) {
      query = query.orderBy(orderBy, "desc") as any;
    }

    return query.onSnapshot(
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];
        callback(data);
      },
      (error) => {
        console.error("Collection snapshot error:", error);
        callback([]);
      }
    );
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

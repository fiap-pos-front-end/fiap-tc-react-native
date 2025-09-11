import auth from "@react-native-firebase/auth";
import firestore, {
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";

type Dir = "asc" | "desc";

type WhereTuple = [
  field: string,
  op: FirebaseFirestoreTypes.WhereFilterOp,
  value: any
];

export type PageOptions = {
  orderBy?: string | string[];
  direction?: Dir;
  limit?: number;
  where?: WhereTuple[];
};

type PageCursor =
  | {
      snapshot: FirebaseFirestoreTypes.DocumentSnapshot;
      values?: never;
    }
  | {
      values: any[];
      snapshot?: never;
    };

export type PageResult<T> = {
  items: T[];

  cursor: FirebaseFirestoreTypes.DocumentSnapshot | null;

  cursorValues: any[] | null;
  hasNext: boolean;
};

export class FirestoreService {
  private db = firestore();
  private activeListeners = new Map<string, () => void>();

  private getCurrentUserId(): string | null {
    return auth().currentUser?.uid || null;
  }

  private requireAuth(): string {
    const userId = this.getCurrentUserId();
    if (!userId) throw new Error("User not authenticated");
    return userId;
  }

  public disconnectAllListeners(): void {
    this.activeListeners.forEach((u, k) => {
      try {
        u();
      } catch (e) {
        console.error(`❌ Erro ao desconectar ${k}:`, e);
      }
    });
    this.activeListeners.clear();
  }

  public disconnectUserListeners(userId: string): void {
    const keys = Array.from(this.activeListeners.keys()).filter((k) =>
      k.includes(userId)
    );
    keys.forEach((k) => {
      const u = this.activeListeners.get(k);
      if (u) {
        u();
        this.activeListeners.delete(k);
      }
    });
  }

  async addDocument<T extends Record<string, any>>(
    collection: string,
    data: Omit<T, "id" | "userId" | "created" | "updated">
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
          return { id: doc.id, ...data } as unknown as T;
        }
      }
      return null;
    } catch (error) {
      console.error("Error getting document:", error);
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
      const snap = await this.db.collection(collection).doc(id).get();
      if (!snap.exists || snap.data()?.userId !== userId) {
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
      const snap = await this.db.collection(collection).doc(id).get();
      if (!snap.exists || snap.data()?.userId !== userId) {
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

    const existing = this.activeListeners.get(listenerKey);
    if (existing) existing();

    const unsubscribe = this.db
      .collection(collection)
      .doc(id)
      .onSnapshot(
        (doc) => {
          if (!doc.exists) {
            callback(null);
            return;
          }
          const data = doc.data();
          if (data?.userId === userId) {
            callback({ id: doc.id, ...data } as unknown as T);
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
      orderBy ?? "no-order"
    }`;

    const existing = this.activeListeners.get(listenerKey);
    if (existing) existing();

    let q: FirebaseFirestoreTypes.Query = this.db
      .collection(collection)
      .where("userId", "==", userId);

    let hasOrdering = false;
    if (orderBy) {
      try {
        q = q.orderBy(orderBy as string, "desc");
        hasOrdering = true;
      } catch (e) {
        console.warn(
          `Could not add orderBy "${orderBy}" to real-time query, will sort in memory`,
          e
        );
        hasOrdering = false;
      }
    }

    const doMap = (snapshot: FirebaseFirestoreTypes.QuerySnapshot): T[] => {
      let data = snapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() } as unknown as T)
      );
      if (orderBy && !hasOrdering && data.length) {
        data = (data as any[]).sort((a, b) => {
          const av = (a as any)[orderBy];
          const bv = (b as any)[orderBy];
          if (typeof av === "string" && typeof bv === "string")
            return bv.localeCompare(av);
          if (av < bv) return 1;
          if (av > bv) return -1;
          return 0;
        });
      }
      return data;
    };

    const unsubscribe = q.onSnapshot(
      (snap) => callback(doMap(snap)),
      (error) => {
        console.error("Collection snapshot error:", error);

        if (orderBy) {
          const simple = this.db
            .collection(collection)
            .where("userId", "==", userId);
          const fallbackUnsub = simple.onSnapshot(
            (snap) => callback(doMap(snap)),
            (err2) => {
              console.error("Fallback snapshot error:", err2);
              callback([]);
            }
          );

          this.activeListeners.set(listenerKey, fallbackUnsub);
        } else {
          callback([]);
        }
      }
    );

    this.activeListeners.set(listenerKey, unsubscribe);
    return () => {
      const u = this.activeListeners.get(listenerKey);
      if (u) {
        u();
        this.activeListeners.delete(listenerKey);
      }
    };
  }

  private normalizeOrderBy(orderBy?: string | string[]): string[] {
    if (!orderBy) return ["created", "id"];
    return Array.isArray(orderBy) ? orderBy : [orderBy];
  }

  private mapOrderField(
    field: string
  ): string | FirebaseFirestoreTypes.FieldPath {
    if (field === "id") {
      return firestore.FieldPath.documentId();
    }
    return field;
  }

  private buildQuery(
    col: string,
    userId: string,
    opts?: PageOptions,
    start?: PageCursor
  ) {
    const orderFields = this.normalizeOrderBy(opts?.orderBy);
    const direction: Dir = opts?.direction ?? "desc";
    const limitUsed = opts?.limit && opts.limit > 0 ? opts.limit : 20;

    let q: FirebaseFirestoreTypes.Query = this.db
      .collection(col)
      .where("userId", "==", userId);

    if (opts?.where?.length) {
      for (const [field, op, value] of opts.where) {
        q = q.where(field, op, value);
      }
    }

    for (const field of orderFields) {
      const mapped = this.mapOrderField(field);
      q = q.orderBy(mapped as any, direction);
    }

    if (start?.snapshot) q = q.startAfter(start.snapshot);
    else if (start?.values) q = q.startAfter(...start.values);

    q = q.limit(limitUsed);

    return { q, orderFields, limitUsed };
  }

  private extractCursorValuesFrom(
    lastDoc: FirebaseFirestoreTypes.DocumentSnapshot,
    lastItem: Record<string, any>,
    orderFields: string[]
  ): any[] {
    return orderFields.map((f) => (f === "id" ? lastDoc.id : lastItem[f]));
  }

  private toPageResult<T>(
    snapshot: FirebaseFirestoreTypes.QuerySnapshot,
    orderFields: string[],
    limitUsed: number
  ): PageResult<T> {
    const docs = snapshot.docs;
    const items = docs.map((d) => ({ id: d.id, ...d.data() } as unknown as T));
    const lastDoc = docs.length ? docs[docs.length - 1] : null;
    const cursorValues =
      items.length && lastDoc
        ? this.extractCursorValuesFrom(
            lastDoc,
            items[items.length - 1] as any,
            orderFields
          )
        : null;

    const hasNext = docs.length === limitUsed;

    return { items, cursor: lastDoc, cursorValues, hasNext };
  }

  async getPage<T>(
    collection: string,
    opts?: PageOptions,
    start?: FirebaseFirestoreTypes.DocumentSnapshot
  ): Promise<PageResult<T>> {
    try {
      const userId = this.requireAuth();
      const { q, orderFields, limitUsed } = this.buildQuery(
        collection,
        userId,
        opts,
        start ? { snapshot: start } : undefined
      );
      const snapshot = await q.get();
      return this.toPageResult<T>(snapshot, orderFields, limitUsed);
    } catch (error) {
      console.error("Error getting page:", error);
      throw error;
    }
  }
  private buildStartValuesFromSnapshot(
    orderFields: string[],
    lastSnap: FirebaseFirestoreTypes.DocumentSnapshot
  ): any[] {
    return orderFields.map((f) => (f === "id" ? lastSnap.id : lastSnap.get(f)));
  }

  async getNextPage<T>(
    collection: string,
    opts: PageOptions,
    lastCursor: FirebaseFirestoreTypes.DocumentSnapshot
  ): Promise<PageResult<T>> {
    try {
      const userId = this.requireAuth();

      const orderFields = this.normalizeOrderBy(opts.orderBy);

      const startValues = this.buildStartValuesFromSnapshot(
        orderFields,
        lastCursor
      );

      const { q, limitUsed } = (() => {
        const direction: Dir = opts?.direction ?? "desc";
        const limitUsed = opts?.limit && opts.limit > 0 ? opts.limit : 20;

        let q: FirebaseFirestoreTypes.Query = this.db
          .collection(collection)
          .where("userId", "==", userId);

        if (opts?.where?.length) {
          for (const [field, op, value] of opts.where) {
            q = q.where(field, op, value);
          }
        }

        for (const field of orderFields) {
          const mapped = this.mapOrderField(field);
          q = q.orderBy(mapped as any, direction);
        }

        q = q.startAfter(...startValues).limit(limitUsed);
        return { q, limitUsed };
      })();

      const snapshot = await q.get();
      return this.toPageResult<T>(snapshot, orderFields, limitUsed);
    } catch (error) {
      console.error("Error getting next page:", error);
      throw error;
    }
  }

  async getPageByValues<T>(
    collection: string,
    opts?: PageOptions,
    startValues?: any[]
  ): Promise<PageResult<T>> {
    try {
      const userId = this.requireAuth();
      const { q, orderFields, limitUsed } = this.buildQuery(
        collection,
        userId,
        opts,
        startValues ? { values: startValues } : undefined
      );
      const snapshot = await q.get();
      return this.toPageResult<T>(snapshot, orderFields, limitUsed);
    } catch (error) {
      console.error("Error getting page by values:", error);
      throw error;
    }
  }

  async getNextPageByValues<T>(
    collection: string,
    opts: PageOptions,
    lastValues: any[]
  ): Promise<PageResult<T>> {
    try {
      const userId = this.requireAuth();
      const { q, orderFields, limitUsed } = this.buildQuery(
        collection,
        userId,
        opts,
        {
          values: lastValues,
        }
      );
      const snapshot = await q.get();
      return this.toPageResult<T>(snapshot, orderFields, limitUsed);
    } catch (error) {
      console.error("Error getting next page by values:", error);
      throw error;
    }
  }

  onCollectionPageSnapshot<T>(
    collection: string,
    opts: PageOptions,
    onData: (page: PageResult<T>) => void,
    start?: PageCursor
  ): () => void {
    const userId = this.getCurrentUserId();
    if (!userId) {
      onData({ items: [], cursor: null, cursorValues: null, hasNext: false });
      return () => {};
    }

    const orderFields = this.normalizeOrderBy(opts.orderBy);
    const direction: Dir = opts.direction ?? "desc";
    const limitUsed = opts.limit ?? 20;

    let q: FirebaseFirestoreTypes.Query = this.db
      .collection(collection)
      .where("userId", "==", userId);

    if (opts.where?.length) {
      for (const [field, op, value] of opts.where)
        q = q.where(field, op, value);
    }
    for (const f of orderFields) {
      const mapped = this.mapOrderField(f);
      q = q.orderBy(mapped as any, direction);
    }
    if (start?.snapshot) q = q.startAfter(start.snapshot);
    else if (start?.values) q = q.startAfter(...start.values);
    q = q.limit(limitUsed);

    const listenerKey = `page_${collection}_${userId}_${orderFields.join(
      ","
    )}_${direction}_${limitUsed}`;

    const existing = this.activeListeners.get(listenerKey);
    if (existing) existing();

    const unsub = q.onSnapshot(
      (snap) => {
        const result = this.toPageResult<T>(snap, orderFields, limitUsed);
        onData(result);
      },
      (error) => {
        console.error("Paged snapshot error:", error);
        onData({ items: [], cursor: null, cursorValues: null, hasNext: false });
      }
    );

    this.activeListeners.set(listenerKey, unsub);
    return () => {
      unsub();
      this.activeListeners.delete(listenerKey);
    };
  }

  async getCollection<T>(
    collection: string,
    orderBy?: string,
    limit?: number
  ): Promise<T[]> {
    const page = await this.getPage<T>(collection, {
      orderBy: orderBy ? [orderBy] : ["created", "id"],
      direction: "desc",
      limit: limit ?? 50,
    });
    return page.items;
  }

  async queryCollection<T>(
    collection: string,
    field: string,
    operator: FirebaseFirestoreTypes.WhereFilterOp,
    value: any
  ): Promise<T[]> {
    try {
      const userId = this.requireAuth();
      const snap = await this.db
        .collection(collection)
        .where("userId", "==", userId)
        .where(field, operator, value)
        .get();

      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as unknown as T));
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

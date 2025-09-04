import { BaseEntity } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { firestoreService } from "./useFirestore";

interface FirebaseCRUDResult<T extends BaseEntity> {
  data: T[];
  loading: boolean;
  error: string | null;
  create: (item: Omit<T, "id">) => Promise<string>;
  update: (id: string, item: Partial<T>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  findById: (id: string) => T | undefined;
  clear: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useFirebaseCRUD<T extends BaseEntity>(
  collectionName: string,
  orderBy?: string
): FirebaseCRUDResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = firestoreService.onCollectionSnapshot<T>(
      collectionName,
      (newData: T[]) => {
        setData(newData);
        setLoading(false);
      },
      orderBy
    );

    return unsubscribe;
  }, [collectionName, orderBy]);

  const create = useCallback(
    async (item: Omit<T, "id">): Promise<string> => {
      try {
        setError(null);
        const id = await firestoreService.addDocument<T>(collectionName, item);
        return id;
      } catch (err) {
        const errorMessage = (err as Error).message;
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [collectionName]
  );

  const update = useCallback(
    async (id: string, item: Partial<T>): Promise<void> => {
      try {
        setError(null);
        await firestoreService.updateDocument<T>(collectionName, id, item);
      } catch (err) {
        const errorMessage = (err as Error).message;
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [collectionName]
  );

  const remove = useCallback(
    async (id: string): Promise<void> => {
      try {
        setError(null);
        await firestoreService.deleteDocument(collectionName, id);
      } catch (err) {
        const errorMessage = (err as Error).message;
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [collectionName]
  );

  const findById = useCallback(
    (id: string): T | undefined => {
      return data.find((item) => item.id === id);
    },
    [data]
  );

  const clear = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      const promises = data.map((item) =>
        firestoreService.deleteDocument(collectionName, item.id)
      );
      await Promise.all(promises);
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [collectionName, data]);

  const refresh = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const newData = await firestoreService.getCollection<T>(
        collectionName,
        orderBy
      );
      setData(newData);
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [collectionName, orderBy]);

  return {
    data,
    loading,
    error,
    create,
    update,
    remove,
    findById,
    clear,
    refresh,
  };
}

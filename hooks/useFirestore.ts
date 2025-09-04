import { useCallback, useEffect, useState } from "react";
import { FirestoreService } from "../services/firestore";

interface UseFirestoreState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseFirestoreCollectionState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
}

export const firestoreService = new FirestoreService();

export function useFirestoreDocument<T>(collection: string, id: string | null) {
  const [state, setState] = useState<UseFirestoreState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!id) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    const unsubscribe = firestoreService.onDocumentSnapshot<T>(
      collection,
      id,
      (data) => {
        setState({ data, loading: false, error: null });
      }
    );

    return unsubscribe;
  }, [collection, id]);

  const updateDocument = useCallback(
    async (data: Partial<T>) => {
      if (!id) return;

      try {
        await firestoreService.updateDocument(collection, id, data);
      } catch (error) {
        setState((prev) => ({ ...prev, error: (error as Error).message }));
      }
    },
    [collection, id]
  );

  const deleteDocument = useCallback(async () => {
    if (!id) return;

    try {
      await firestoreService.deleteDocument(collection, id);
    } catch (error) {
      setState((prev) => ({ ...prev, error: (error as Error).message }));
    }
  }, [collection, id]);

  return {
    ...state,
    updateDocument,
    deleteDocument,
  };
}

export function useFirestoreCollection<T>(
  collection: string,
  orderBy?: string
) {
  const [state, setState] = useState<UseFirestoreCollectionState<T>>({
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    const unsubscribe = firestoreService.onCollectionSnapshot<T>(
      collection,
      (data) => {
        setState({ data, loading: false, error: null });
      },
      orderBy
    );

    return unsubscribe;
  }, [collection, orderBy]);

  const addDocument = useCallback(
    async (data: Omit<T, "id">) => {
      try {
        const id = await firestoreService.addDocument(collection, data);
        return id;
      } catch (error) {
        setState((prev) => ({ ...prev, error: (error as Error).message }));
        throw error;
      }
    },
    [collection]
  );

  const queryDocuments = useCallback(
    async (field: string, operator: any, value: any) => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        const data = await firestoreService.queryCollection<T>(
          collection,
          field,
          operator,
          value
        );
        setState({ data, loading: false, error: null });
        return data;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: (error as Error).message,
        }));
        throw error;
      }
    },
    [collection]
  );

  return {
    ...state,
    addDocument,
    queryDocuments,
  };
}

export function useFirestoreCRUD<T>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(
    async (collection: string, data: Omit<T, "id">) => {
      try {
        setLoading(true);
        setError(null);
        const id = await firestoreService.addDocument(collection, data);
        return id;
      } catch (err) {
        const errorMessage = (err as Error).message;
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const read = useCallback(async (collection: string, id: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await firestoreService.getDocument<T>(collection, id);
      return data;
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(
    async (collection: string, id: string, data: Partial<T>) => {
      try {
        setLoading(true);
        setError(null);
        await firestoreService.updateDocument(collection, id, data);
      } catch (err) {
        const errorMessage = (err as Error).message;
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const remove = useCallback(async (collection: string, id: string) => {
    try {
      setLoading(true);
      setError(null);
      await firestoreService.deleteDocument(collection, id);
    } catch (err) {
      const errorMessage = (err as Error).message;
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCollection = useCallback(
    async (collection: string, orderBy?: string, limit?: number) => {
      try {
        setLoading(true);
        setError(null);
        const data = await firestoreService.getCollection<T>(
          collection,
          orderBy,
          limit
        );
        return data;
      } catch (err) {
        const errorMessage = (err as Error).message;
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    create,
    read,
    update,
    remove,
    getCollection,
  };
}

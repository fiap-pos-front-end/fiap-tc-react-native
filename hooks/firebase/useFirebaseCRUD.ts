import { FirestoreService } from "@/services/firestore";
import type { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "./useAuth";

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

export type Dir = "asc" | "desc";

export type WhereTuple = [
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

type PageResult<T> = import("@/services/firestore").PageResult<T>;

export const firestoreService = new FirestoreService();

export function useFirestoreDocument<T>(collection: string, id: string | null) {
  const { user } = useAuth();
  const [state, setState] = useState<UseFirestoreState<T>>({
    data: null,
    loading: true,
    error: null,
  });
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    if (!id || !user?.uid) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const unsubscribe = firestoreService.onDocumentSnapshot<T>(
        collection,
        id,
        (data) => setState({ data, loading: false, error: null })
      );
      unsubscribeRef.current = unsubscribe;

      return () => {
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }
      };
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: (error as Error).message,
      });
    }
  }, [collection, id, user?.uid]);

  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, []);

  const updateDocument = useCallback(
    async (data: Partial<T>) => {
      if (!id) return;
      try {
        await firestoreService.updateDocument(collection, id, data);
      } catch (error) {
        setState((prev) => ({ ...prev, error: (error as Error).message }));
        throw error;
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
      throw error;
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
  const { user } = useAuth();
  const [state, setState] = useState<UseFirestoreCollectionState<T>>({
    data: [],
    loading: true,
    error: null,
  });

  const unsubscribeRef = useRef<(() => void) | null>(null);
  const lastUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    const currentUserId = user?.uid || null;

    if (lastUserIdRef.current !== currentUserId) {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      setState({ data: [], loading: true, error: null });
      lastUserIdRef.current = currentUserId;
    }

    if (!user?.uid) {
      setState({ data: [], loading: false, error: null });
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const unsubscribe = firestoreService.onCollectionSnapshot<T>(
        collection,
        (data) => setState({ data, loading: false, error: null }),
        orderBy
      );

      unsubscribeRef.current = unsubscribe;

      return () => {
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }
      };
    } catch (error) {
      setState({
        data: [],
        loading: false,
        error: (error as Error).message,
      });
    }
  }, [collection, orderBy, user?.uid]);

  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, []);

  const addDocument = useCallback(
    async (data: Omit<T, "id" | "userId">) => {
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

export function useFirestorePagedCollection<T>(
  collection: string,
  options?: PageOptions,
  mode: "snapshot" | "values" = "snapshot"
) {
  const { user } = useAuth();

  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const cursorRef = useRef<FirebaseFirestoreTypes.DocumentSnapshot | null>(
    null
  );
  const valuesRef = useRef<any[] | null>(null);
  const hasNextRef = useRef<boolean>(false);

  const stableOpts = useMemo<PageOptions>(() => {
    return {
      orderBy: options?.orderBy ?? ["created", "id"],
      direction: options?.direction ?? "desc",
      limit: options?.limit ?? 20,
      where: options?.where ?? [],
    };
  }, [
    options?.orderBy,
    options?.direction,
    options?.limit,
    JSON.stringify(options?.where),
  ]);

  const reset = useCallback(() => {
    setItems([]);
    setError(null);
    cursorRef.current = null;
    valuesRef.current = null;
    hasNextRef.current = false;
  }, []);

  const loadFirstPage = useCallback(async () => {
    if (!user?.uid) {
      reset();
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      let page: PageResult<T>;
      if (mode === "values") {
        page = await firestoreService.getPageByValues<T>(
          collection,
          stableOpts
        );
      } else {
        page = await firestoreService.getPage<T>(collection, stableOpts);
      }

      setItems(page.items);
      cursorRef.current = page.cursor;
      valuesRef.current = page.cursorValues;
      hasNextRef.current = page.hasNext;
    } catch (e) {
      setError((e as Error).message);
      reset();
    } finally {
      setLoading(false);
    }
  }, [collection, mode, reset, stableOpts, user?.uid]);

  const loadMore = useCallback(async () => {
    if (!user?.uid) return;
    if (!hasNextRef.current) return;

    setLoadingMore(true);
    setError(null);

    try {
      let page: PageResult<T>;
      if (mode === "values") {
        if (!valuesRef.current) return;
        page = await firestoreService.getNextPageByValues<T>(
          collection,
          stableOpts,
          valuesRef.current
        );
      } else {
        if (!cursorRef.current) return;
        page = await firestoreService.getNextPage<T>(
          collection,
          stableOpts,
          cursorRef.current
        );
      }

      setItems((prev) => [...prev, ...page.items]);
      cursorRef.current = page.cursor;
      valuesRef.current = page.cursorValues;
      hasNextRef.current = page.hasNext;
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoadingMore(false);
    }
  }, [collection, mode, stableOpts, user?.uid]);

  const refresh = useCallback(async () => {
    reset();
    await loadFirstPage();
  }, [loadFirstPage, reset]);

  useEffect(() => {
    reset();
    loadFirstPage();
  }, [
    collection,
    mode,
    user?.uid,
    stableOpts.orderBy,
    stableOpts.direction,
    stableOpts.limit,
    JSON.stringify(stableOpts.where),
  ]);

  return {
    data: items,
    loading,
    loadingMore,
    error,
    hasNext: hasNextRef.current,
    loadMore,
    refresh,

    cursor: cursorRef.current,
    cursorValues: valuesRef.current,
    options: stableOpts,
  };
}

export function useFirestoreInfinite<T>(
  collection: string,
  options?: PageOptions,
  mode: "snapshot" | "values" = "snapshot"
) {
  const paged = useFirestorePagedCollection<T>(collection, options, mode);

  const onEndReached = useCallback(() => {
    if (!paged.loading && !paged.loadingMore && paged.hasNext) {
      paged.loadMore();
    }
  }, [paged]);

  const onRefresh = useCallback(() => {
    if (!paged.loading) paged.refresh();
  }, [paged]);

  return {
    ...paged,
    onEndReached,
    onRefresh,
  };
}

export function useFirebaseCRUD<T>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(
    async (collection: string, data: Omit<T, "id" | "userId">) => {
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
    async (collection: string, orderBy?: string | string[], limit?: number) => {
      try {
        setLoading(true);
        setError(null);

        const page = await firestoreService.getPage<T>(collection, {
          orderBy: orderBy ?? ["created", "id"],
          direction: "desc",
          limit: limit ?? 50,
        });
        return page.items;
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

  const queryCollection = useCallback(
    async (collection: string, field: string, operator: any, value: any) => {
      try {
        setLoading(true);
        setError(null);
        const data = await firestoreService.queryCollection<T>(
          collection,
          field,
          operator,
          value
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
    queryCollection,
    isAuthenticated: firestoreService.isAuthenticated(),
  };
}

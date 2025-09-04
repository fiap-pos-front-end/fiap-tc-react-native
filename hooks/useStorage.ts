import { useCallback, useState } from "react";
import { StorageService } from "../services/storage";
import { StorageMetadata, UploadResult } from "../types/firebase";

interface UseStorageState {
  uploading: boolean;
  downloading: boolean;
  progress: number;
  error: string | null;
}
export const storageService = new StorageService();
export function useStorage() {
  const [state, setState] = useState<UseStorageState>({
    uploading: false,
    downloading: false,
    progress: 0,
    error: null,
  });

  const uploadFile = useCallback(
    async (
      localUri: string,
      remotePath: string
    ): Promise<UploadResult | null> => {
      try {
        setState((prev) => ({
          ...prev,
          uploading: true,
          error: null,
          progress: 0,
        }));

        const result = await storageService.uploadFile(
          localUri,
          remotePath,
          (progress) => {
            setState((prev) => ({ ...prev, progress }));
          }
        );

        setState((prev) => ({ ...prev, uploading: false, progress: 100 }));
        return result;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          uploading: false,
          error: (error as Error).message,
        }));
        return null;
      }
    },
    []
  );

  const uploadImage = useCallback(
    async (
      imageUri: string,
      folder?: string,
      fileName?: string
    ): Promise<UploadResult | null> => {
      try {
        setState((prev) => ({
          ...prev,
          uploading: true,
          error: null,
          progress: 0,
        }));

        const result = await storageService.uploadImage(
          imageUri,
          folder,
          fileName
        );

        setState((prev) => ({ ...prev, uploading: false, progress: 100 }));
        return result;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          uploading: false,
          error: (error as Error).message,
        }));
        return null;
      }
    },
    []
  );

  const uploadString = useCallback(
    async (
      content: string,
      remotePath: string,
      format?: "raw" | "base64" | "base64url" | "data_url"
    ): Promise<UploadResult | null> => {
      try {
        setState((prev) => ({ ...prev, uploading: true, error: null }));

        const result = await storageService.uploadString(
          content,
          remotePath,
          format
        );

        setState((prev) => ({ ...prev, uploading: false }));
        return result;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          uploading: false,
          error: (error as Error).message,
        }));
        return null;
      }
    },
    []
  );

  const downloadFile = useCallback(
    async (remotePath: string, localPath: string): Promise<string | null> => {
      try {
        setState((prev) => ({ ...prev, downloading: true, error: null }));

        const result = await storageService.downloadFile(remotePath, localPath);

        setState((prev) => ({ ...prev, downloading: false }));
        return result;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          downloading: false,
          error: (error as Error).message,
        }));
        return null;
      }
    },
    []
  );

  const getDownloadURL = useCallback(
    async (remotePath: string): Promise<string | null> => {
      try {
        setState((prev) => ({ ...prev, error: null }));
        return await storageService.getDownloadURL(remotePath);
      } catch (error) {
        setState((prev) => ({ ...prev, error: (error as Error).message }));
        return null;
      }
    },
    []
  );

  const deleteFile = useCallback(
    async (remotePath: string): Promise<boolean> => {
      try {
        setState((prev) => ({ ...prev, error: null }));
        await storageService.deleteFile(remotePath);
        return true;
      } catch (error) {
        setState((prev) => ({ ...prev, error: (error as Error).message }));
        return false;
      }
    },
    []
  );

  const getMetadata = useCallback(
    async (remotePath: string): Promise<StorageMetadata | null> => {
      try {
        setState((prev) => ({ ...prev, error: null }));
        return await storageService.getMetadata(remotePath);
      } catch (error) {
        setState((prev) => ({ ...prev, error: (error as Error).message }));
        return null;
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const resetProgress = useCallback(() => {
    setState((prev) => ({ ...prev, progress: 0 }));
  }, []);

  return {
    ...state,
    uploadFile,
    uploadImage,
    uploadString,
    downloadFile,
    getDownloadURL,
    deleteFile,
    getMetadata,
    clearError,
    resetProgress,
  };
}

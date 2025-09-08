import {
  storageService,
  UploadProgress,
  UploadResult,
} from "@/services/storage";
import { useCallback, useState } from "react";

interface UseStorageState {
  uploading: boolean;
  downloading: boolean;
  progress: number;
  error: string | null;
}

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
          (progress: UploadProgress) => {
            setState((prev) => ({ ...prev, progress: progress.progress }));
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

  const uploadDocument = useCallback(
    async (
      documentUri: string,
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

        const result = await storageService.uploadDocument(
          documentUri,
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

  const fileExists = useCallback(
    async (remotePath: string): Promise<boolean> => {
      try {
        return await storageService.fileExists(remotePath);
      } catch (error) {
        setState((prev) => ({ ...prev, error: (error as Error).message }));
        return false;
      }
    },
    []
  );

  const getFileMetadata = useCallback(async (remotePath: string) => {
    try {
      setState((prev) => ({ ...prev, error: null }));
      return await storageService.getFileMetadata(remotePath);
    } catch (error) {
      setState((prev) => ({ ...prev, error: (error as Error).message }));
      return null;
    }
  }, []);

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
    uploadDocument,
    getDownloadURL,
    deleteFile,
    downloadFile,
    fileExists,
    getFileMetadata,
    clearError,
    resetProgress,
  };
}

export function useTransferAttachments() {
  const storage = useStorage();

  const uploadAttachment = useCallback(
    async (
      fileUri: string,
      transferId: string,
      fileType: "image" | "document"
    ): Promise<UploadResult | null> => {
      const folder = `transfers/${transferId}/attachments`;
      const fileName = storageService.generateUniqueFileName(
        fileType,
        fileUri.split(".").pop() || "file"
      );
      const remotePath = `${folder}/${fileName}`;

      if (fileType === "image") {
        return await storage.uploadImage(fileUri, folder, fileName);
      } else {
        return await storage.uploadDocument(fileUri, folder, fileName);
      }
    },
    [storage]
  );

  const listAttachments = useCallback(async (transferId: string) => {
    try {
      const folder = `transfers/${transferId}/attachments`;
      const result = await storageService.listFiles(folder);

      const attachments = await Promise.all(
        result.items.map(async (item) => {
          const downloadURL = await item.getDownloadURL();
          const metadata = await item.getMetadata();

          return {
            name: metadata.name,
            downloadURL,
            size: metadata.size,
            type: storageService.getFileType(metadata.name),
            fullPath: metadata.fullPath,
            created: metadata.timeCreated,
          };
        })
      );

      return attachments;
    } catch (error) {
      console.error("Error listing attachments:", error);
      return [];
    }
  }, []);

  const deleteAttachment = useCallback(
    async (fullPath: string): Promise<boolean> => {
      return await storage.deleteFile(fullPath);
    },
    [storage]
  );

  const deleteAllAttachments = useCallback(
    async (transferId: string): Promise<boolean> => {
      try {
        const attachments = await listAttachments(transferId);

        const deletePromises = attachments.map((attachment) =>
          storage.deleteFile(attachment.fullPath)
        );

        await Promise.all(deletePromises);
        return true;
      } catch (error) {
        console.error("Error deleting all attachments:", error);
        return false;
      }
    },
    [storage, listAttachments]
  );

  return {
    ...storage,
    uploadAttachment,
    listAttachments,
    deleteAttachment,
    deleteAllAttachments,
  };
}

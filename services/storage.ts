import storage, { FirebaseStorageTypes } from "@react-native-firebase/storage";

export interface UploadResult {
  downloadURL: string;
  fileName: string;
  size: number;
  fullPath: string;
}

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  progress: number;
}

export class StorageService {
  private storage = storage();

  async uploadFile(
    localUri: string,
    remotePath: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    try {
      const reference = this.storage.ref(remotePath);

      const task = reference.putFile(localUri);

      if (onProgress) {
        task.on("state_changed", (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress({
            bytesTransferred: snapshot.bytesTransferred,
            totalBytes: snapshot.totalBytes,
            progress,
          });
        });
      }

      await task;

      const downloadURL = await reference.getDownloadURL();
      const metadata = await reference.getMetadata();

      return {
        downloadURL,
        fileName: metadata.name,
        size: metadata.size,
        fullPath: metadata.fullPath,
      };
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  }

  async uploadImage(
    imageUri: string,
    folder: string = "images",
    fileName?: string
  ): Promise<UploadResult> {
    try {
      const timestamp = Date.now();
      const extension = imageUri.split(".").pop() || "jpg";
      const finalFileName = fileName || `image_${timestamp}.${extension}`;
      const remotePath = `${folder}/${finalFileName}`;

      return await this.uploadFile(imageUri, remotePath);
    } catch (error) {
      console.error("Upload image error:", error);
      throw error;
    }
  }

  async uploadDocument(
    documentUri: string,
    folder: string = "documents",
    fileName?: string
  ): Promise<UploadResult> {
    try {
      const timestamp = Date.now();
      const extension = documentUri.split(".").pop() || "pdf";
      const finalFileName = fileName || `document_${timestamp}.${extension}`;
      const remotePath = `${folder}/${finalFileName}`;

      return await this.uploadFile(documentUri, remotePath);
    } catch (error) {
      console.error("Upload document error:", error);
      throw error;
    }
  }

  async getDownloadURL(remotePath: string): Promise<string> {
    try {
      const reference = this.storage.ref(remotePath);
      return await reference.getDownloadURL();
    } catch (error) {
      console.error("Get URL error:", error);
      throw error;
    }
  }

  async deleteFile(remotePath: string): Promise<void> {
    try {
      const reference = this.storage.ref(remotePath);
      await reference.delete();
    } catch (error) {
      console.error("Delete error:", error);
      throw error;
    }
  }

  async getFileMetadata(
    remotePath: string
  ): Promise<FirebaseStorageTypes.FullMetadata> {
    try {
      const reference = this.storage.ref(remotePath);
      return await reference.getMetadata();
    } catch (error) {
      console.error("Get metadata error:", error);
      throw error;
    }
  }

  async listFiles(path: string): Promise<{
    items: FirebaseStorageTypes.Reference[];
    prefixes: FirebaseStorageTypes.Reference[];
  }> {
    try {
      const reference = this.storage.ref(path);
      const result = await reference.list();
      return {
        items: result.items,
        prefixes: result.prefixes,
      };
    } catch (error) {
      console.error("List files error:", error);
      throw error;
    }
  }

  async downloadFile(remotePath: string, localPath: string): Promise<string> {
    try {
      const reference = this.storage.ref(remotePath);
      await reference.writeToFile(localPath);
      return localPath;
    } catch (error) {
      console.error("Download error:", error);
      throw error;
    }
  }

  async fileExists(remotePath: string): Promise<boolean> {
    try {
      const reference = this.storage.ref(remotePath);
      await reference.getMetadata();
      return true;
    } catch (error) {
      return false;
    }
  }

  generateUniqueFileName(prefix: string, extension: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}_${timestamp}_${random}.${extension}`;
  }

  getFileType(fileName: string): "image" | "document" | "other" {
    const extension = fileName.split(".").pop()?.toLowerCase();

    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "bmp"];
    const documentExtensions = ["pdf", "doc", "docx", "txt", "rtf"];

    if (imageExtensions.includes(extension || "")) {
      return "image";
    } else if (documentExtensions.includes(extension || "")) {
      return "document";
    }

    return "other";
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
}

export const storageService = new StorageService();

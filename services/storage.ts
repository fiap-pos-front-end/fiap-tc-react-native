import { StorageMetadata, UploadResult } from "@/types/firebase";
import storage, { FirebaseStorageTypes } from "@react-native-firebase/storage";

export class StorageService {
  private storage = storage();

  async uploadFile(
    localUri: string,
    remotePath: string,
    onProgress?: (progress: number) => void
  ): Promise<UploadResult> {
    try {
      const reference = this.storage.ref(remotePath);

      const task = reference.putFile(localUri);

      if (onProgress) {
        task.on("state_changed", (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(progress);
        });
      }

      await task;

      const downloadURL = await reference.getDownloadURL();
      const metadata = await reference.getMetadata();

      return {
        downloadURL,
        fileName: metadata.name,
        size: metadata.size,
      };
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  }

  async uploadString(
    content: string,
    remotePath: string,
    format: "raw" | "base64" | "base64url" | "data_url" = "raw"
  ): Promise<UploadResult> {
    try {
      const reference = this.storage.ref(remotePath);

      await reference.putString(content, format);

      const downloadURL = await reference.getDownloadURL();
      const metadata = await reference.getMetadata();

      return {
        downloadURL,
        fileName: metadata.name,
        size: metadata.size,
      };
    } catch (error) {
      console.error("Upload string error:", error);
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

  async getMetadata(remotePath: string): Promise<StorageMetadata> {
    try {
      const reference = this.storage.ref(remotePath);
      const metadata = await reference.getMetadata();

      return {
        name: metadata.name,
        size: metadata.size,
        contentType: metadata.contentType || "",
        timeCreated: metadata.timeCreated,
        updated: metadata.updated,
      };
    } catch (error) {
      console.error("Get metadata error:", error);
      throw error;
    }
  }

  async listFiles(path: string): Promise<FirebaseStorageTypes.ListResult> {
    try {
      const reference = this.storage.ref(path);
      return await reference.list();
    } catch (error) {
      console.error("List files error:", error);
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
      const finalFileName = fileName || `image_${timestamp}.jpg`;
      const remotePath = `${folder}/${finalFileName}`;

      return await this.uploadFile(imageUri, remotePath);
    } catch (error) {
      console.error("Upload image error:", error);
      throw error;
    }
  }
}

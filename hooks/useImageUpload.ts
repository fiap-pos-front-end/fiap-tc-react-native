import { useCallback, useState } from "react";
import { useStorage } from "./firebase/useStorage";

export function useImageUpload() {
  const { uploadImage, uploading, progress, error } = useStorage();
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const selectAndUploadImage = useCallback(
    async (imageUri: string, folder?: string): Promise<string | null> => {
      setPreviewUri(imageUri);
      setUploadedUrl(null);

      const result = await uploadImage(imageUri, folder);

      if (result) {
        setUploadedUrl(result.downloadURL);
        return result.downloadURL;
      }

      return null;
    },
    [uploadImage]
  );

  const clearPreview = useCallback(() => {
    setPreviewUri(null);
    setUploadedUrl(null);
  }, []);

  return {
    uploading,
    progress,
    error,
    previewUri,
    uploadedUrl,
    selectAndUploadImage,
    clearPreview,
  };
}

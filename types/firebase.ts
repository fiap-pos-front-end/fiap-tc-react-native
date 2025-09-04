export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  created: Date;
  updated?: Date;
}

export interface UploadResult {
  downloadURL: string;
  fileName: string;
  size: number;
}

export interface StorageMetadata {
  name: string;
  size: number;
  contentType: string;
  timeCreated: string;
  updated: string;
}

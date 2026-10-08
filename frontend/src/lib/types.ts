export interface User {
  id: string;
  name: string;
  email: string;
  storageUsed: number;
  storageLimit: number;
  avatar?: string;
}

export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size: number;
  updatedAt: string;
  createdAt: string;
  parentId?: string | null;
  mimeType?: string;
  isTrash?: boolean;
  trashedAt?: string | null;
  isFavorite?: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}
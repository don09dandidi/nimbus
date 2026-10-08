import { User, FileItem } from './types';

const BASE_URL: string = (import.meta.env.VITE_API_URL as string | undefined) || '';

interface ApiUser { id: number; username: string; createdAt?: string }
interface ApiFile {
  id: number;
  originalFilename: string;
  fileSize: number;
  contentType: string;
  uploadedAt: string;
}

export interface SharedItem extends FileItem {
  sharedWith: string;
  sharedAt: string;
}

function toUser(u: ApiUser): User {
  return {
    id: String(u.id),
    name: u.username,
    email: u.username,
    storageUsed: 0,
    storageLimit: 10 * 1024 * 1024 * 1024,
  };
}

function toFileItem(f: ApiFile): FileItem {
  const fileParents = getFileParents();
  return {
    id: String(f.id),
    name: f.originalFilename,
    type: 'file',
    size: f.fileSize,
    updatedAt: f.uploadedAt,
    createdAt: f.uploadedAt,
    parentId: fileParents[String(f.id)] || null,
    mimeType: f.contentType || undefined,
  };
}

// Persistență asociere fișier -> folder
const FILE_PARENTS_KEY = 'nimbus_file_parents';
function getFileParents(): Record<string, string> {
  try {
    const data = localStorage.getItem(FILE_PARENTS_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}
function saveFileParent(fileId: string, folderId: string | null) {
  const current = getFileParents();
  if (folderId) current[fileId] = folderId;
  else delete current[fileId];
  localStorage.setItem(FILE_PARENTS_KEY, JSON.stringify(current));
}

// Persistență foldere virtuale
const LOCAL_FOLDERS_KEY = 'nimbus_virtual_folders';
function getLocalFolders(): FileItem[] {
  try {
    const data = localStorage.getItem(LOCAL_FOLDERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}
function saveLocalFolders(folders: FileItem[]) {
  localStorage.setItem(LOCAL_FOLDERS_KEY, JSON.stringify(folders));
}

// Persistență Coș de Gunoi
const TRASH_ITEMS_KEY = 'nimbus_trash_items';
function getLocalTrash(): FileItem[] {
  try {
    const data = localStorage.getItem(TRASH_ITEMS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}
function saveLocalTrash(items: FileItem[]) {
  localStorage.setItem(TRASH_ITEMS_KEY, JSON.stringify(items));
}

// Persistență Fișiere Partajate
const SHARED_ITEMS_KEY = 'nimbus_shared_items';
function getLocalShared(): SharedItem[] {
  try {
    const data = localStorage.getItem(SHARED_ITEMS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}
function saveLocalShared(items: SharedItem[]) {
  localStorage.setItem(SHARED_ITEMS_KEY, JSON.stringify(items));
}

async function errorMessage(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (body?.error) return String(body.error);
  } catch {}
  if (res.status === 413) return 'Fișierul este prea mare.';
  return `Eroare HTTP: ${res.status}`;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}/api${path}`, {
    credentials: 'include',
    ...init,
    headers: {
      ...(init.body && !(init.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
      ...(init.headers || {}),
    },
  });
  if (!res.ok) throw new Error(await errorMessage(res));
  return res.json() as Promise<T>;
}

class ApiClient {
  async login(username: string, password: string): Promise<User> {
    const u = await request<ApiUser>('/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    return toUser(u);
  }

  async register(username: string, password: string): Promise<User> {
    const u = await request<ApiUser>('/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    return toUser(u);
  }

  async logout(): Promise<void> {
    await request<unknown>('/logout', { method: 'POST' });
  }

  async getCurrentUser(): Promise<User> {
    return toUser(await request<ApiUser>('/me'));
  }

  async getFiles(parentId?: string | null): Promise<FileItem[]> {
    const serverFiles = await request<ApiFile[]>('/files');
    const mappedFiles = serverFiles.map(toFileItem);
    const localFolders = getLocalFolders();
    const trash = getLocalTrash();
    const trashIds = new Set(trash.map(t => t.id));

    const allItems = [...localFolders, ...mappedFiles].filter(item => !trashIds.has(item.id));

    if (parentId) {
      return allItems.filter(item => item.parentId === parentId);
    }
    return allItems.filter(item => !item.parentId);
  }

  async getTrashFiles(): Promise<FileItem[]> {
    return getLocalTrash();
  }

  // Partajare
  async getSharedFiles(): Promise<SharedItem[]> {
    return getLocalShared();
  }

  async shareFile(fileItem: FileItem, email: string): Promise<SharedItem> {
    const shared = getLocalShared();
    const newItem: SharedItem = {
      ...fileItem,
      sharedWith: email,
      sharedAt: new Date().toLocaleDateString('ro-RO'),
    };
    shared.push(newItem);
    saveLocalShared(shared);
    return newItem;
  }

  async unshareFile(fileId: string): Promise<void> {
    const shared = getLocalShared().filter(s => s.id !== fileId);
    saveLocalShared(shared);
  }

  async uploadFile(file: File, parentId?: string | null): Promise<FileItem> {
    const formData = new FormData();
    formData.append('file', file);
    const uploaded = await request<ApiFile>('/files', { method: 'POST', body: formData });
    const item = toFileItem(uploaded);
    if (parentId) {
      saveFileParent(item.id, parentId);
      item.parentId = parentId;
    }
    return item;
  }

  async moveFileToFolder(fileId: string, folderId: string | null): Promise<void> {
    saveFileParent(fileId, folderId);
  }

  async createFolder(name: string, parentId?: string | null): Promise<FileItem> {
    const newFolder: FileItem = {
      id: 'folder_' + Date.now(),
      name,
      type: 'folder',
      size: 0,
      createdAt: new Date().toLocaleDateString('ro-RO'),
      updatedAt: new Date().toLocaleDateString('ro-RO'),
      parentId: parentId || null,
    };
    const current = getLocalFolders();
    current.push(newFolder);
    saveLocalFolders(current);
    return newFolder;
  }

  async moveToTrash(fileItem: FileItem): Promise<void> {
    const trash = getLocalTrash();
    if (!trash.some(t => t.id === fileItem.id)) {
      trash.push({ ...fileItem, updatedAt: new Date().toLocaleDateString('ro-RO') });
      saveLocalTrash(trash);
    }
    // dacă era partajat, îl scoatem și din partajate
    await this.unshareFile(fileItem.id);
  }

  async restoreFromTrash(id: string): Promise<void> {
    const trash = getLocalTrash().filter(t => t.id !== id);
    saveLocalTrash(trash);
  }

  async permanentDelete(id: string): Promise<void> {
    const trash = getLocalTrash().filter(t => t.id !== id);
    saveLocalTrash(trash);

    if (id.startsWith('folder_')) {
      const folders = getLocalFolders().filter(f => f.id !== id);
      saveLocalFolders(folders);
      return;
    }

    try {
      await request<unknown>(`/files/${encodeURIComponent(id)}`, { method: 'DELETE' });
    } catch {}
  }

  async downloadFile(id: string, filename: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/files/${encodeURIComponent(id)}`, { credentials: 'include' });
    if (!res.ok) throw new Error(await errorMessage(res));

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

export const apiClient = new ApiClient();
export const api = apiClient;
export default apiClient;

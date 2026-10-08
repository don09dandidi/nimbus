import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, FileItem } from '../lib/types';
import { apiClient, SharedItem } from '../lib/apiClient';

interface AppContextType {
  user: User | null;
  files: FileItem[];
  trashFiles: FileItem[];
  sharedFiles: SharedItem[];
  currentFolderId: string | null;
  setCurrentFolderId: (id: string | null) => void;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  refreshFiles: () => Promise<void>;
  uploadFile: (file: File) => Promise<void>;
  createFolder: (name: string) => Promise<void>;
  deleteFile: (file: FileItem) => Promise<void>;
  restoreFile: (id: string) => Promise<void>;
  permanentDeleteFile: (id: string) => Promise<void>;
  moveFile: (fileId: string, folderId: string | null) => Promise<void>;
  shareFile: (file: FileItem, email: string) => Promise<void>;
  unshareFile: (fileId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [trashFiles, setTrashFiles] = useState<FileItem[]>([]);
  const [sharedFiles, setSharedFiles] = useState<SharedItem[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const initAuth = async () => {
    try {
      setUser(await apiClient.getCurrentUser());
    } catch {
      setUser(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    initAuth();
  }, []);

  const refreshFiles = async () => {
    if (!user) return;
    try {
      const activeFiles = await apiClient.getFiles();
      setFiles(activeFiles);
      const trash = await apiClient.getTrashFiles();
      setTrashFiles(trash);
      const shared = await apiClient.getSharedFiles();
      setSharedFiles(shared);
    } catch (e) {
      console.error('Eroare la încărcarea fișierelor:', e);
    }
  };

  useEffect(() => {
    if (user) {
      refreshFiles();
    }
  }, [user]);

  const login = (u: User) => {
    setUser(u);
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (e) {
      console.error(e);
    }
    setUser(null);
    setFiles([]);
    setTrashFiles([]);
    setSharedFiles([]);
    setCurrentFolderId(null);
  };

  const uploadFile = async (file: File) => {
    const uploaded = await apiClient.uploadFile(file, currentFolderId);
    setFiles(prev => [...prev, uploaded]);
  };

  const createFolder = async (name: string) => {
    const folder = await apiClient.createFolder(name, currentFolderId);
    setFiles(prev => [...prev, folder]);
  };

  const deleteFile = async (fileItem: FileItem) => {
    await apiClient.moveToTrash(fileItem);
    setFiles(prev => prev.filter(f => f.id !== fileItem.id));
    setTrashFiles(prev => [...prev, { ...fileItem, updatedAt: new Date().toLocaleDateString('ro-RO') }]);
    setSharedFiles(prev => prev.filter(s => s.id !== fileItem.id));
  };

  const restoreFile = async (id: string) => {
    await apiClient.restoreFromTrash(id);
    const restored = trashFiles.find(t => t.id === id);
    setTrashFiles(prev => prev.filter(t => t.id !== id));
    if (restored) {
      setFiles(prev => [...prev, restored]);
    }
  };

  const permanentDeleteFile = async (id: string) => {
    await apiClient.permanentDelete(id);
    setTrashFiles(prev => prev.filter(t => t.id !== id));
  };

  const moveFile = async (fileId: string, folderId: string | null) => {
    await apiClient.moveFileToFolder(fileId, folderId);
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, parentId: folderId } : f));
  };

  const shareFile = async (file: FileItem, email: string) => {
    const item = await apiClient.shareFile(file, email);
    setSharedFiles(prev => [...prev, item]);
  };

  const unshareFile = async (fileId: string) => {
    await apiClient.unshareFile(fileId);
    setSharedFiles(prev => prev.filter(s => s.id !== fileId));
  };

  return (
    <AppContext.Provider
      value={{
        user,
        files,
        trashFiles,
        sharedFiles,
        currentFolderId,
        setCurrentFolderId,
        isLoading,
        login,
        logout,
        refreshFiles,
        uploadFile,
        createFolder,
        deleteFile,
        restoreFile,
        permanentDeleteFile,
        moveFile,
        shareFile,
        unshareFile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp trebuie folosit în interiorul AppProvider');
  return context;
};

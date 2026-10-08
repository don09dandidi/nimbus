import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Download, Trash2, Edit2, Folder, FileText } from 'lucide-react';

interface FileTableProps {
  files: any[];
  isTrashView?: boolean;
}

export const FileTable: React.FC<FileTableProps> = ({ files, isTrashView = false }) => {
  const appContext = useApp() as any;
  const { 
    downloadFile, 
    deleteFile, 
    restoreFile, 
    permanentDelete, 
    renameFile, 
    setCurrentFolderId 
  } = appContext;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>('');

  // Formatare internă pentru dimensiune (nu mai depinde de utils.ts)
  const formatFileSize = (bytes?: number): string => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Formatare internă pentru dată sigură (acceptă atât string cât și Date)
  const formatDisplayDate = (dateVal: any): string => {
    if (!dateVal) return '-';
    try {
      const d = dateVal instanceof Date ? dateVal : new Date(dateVal);
      if (isNaN(d.getTime())) return String(dateVal);
      return d.toLocaleDateString('ro-RO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return String(dateVal);
    }
  };

  const startRename = (file: any) => {
    setEditingId(file.id);
    setEditName(file.name || '');
  };

  const handleSaveRename = async (id: string) => {
    if (editName.trim()) {
      await renameFile(id, editName.trim());
    }
    setEditingId(null);
  };

  if (!files || files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-gray-400">
        <Folder className="w-16 h-16 mb-4 text-gray-300 stroke-1" />
        <p className="text-base font-medium">Nu există niciun fișier sau folder aici.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg border border-gray-100 shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider bg-gray-50/50">
            <th className="py-3 px-4">Nume</th>
            <th className="py-3 px-4">Dimensiune</th>
            <th className="py-3 px-4">Ultima modificare</th>
            <th className="py-3 px-4 text-right">Acțiuni</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
          {files.map((file: any) => {
            const isFolder = file.type === 'folder' || file.isFolder;
            const fileDate = file.updatedAt || file.createdAt || file.modified || file.date;

            return (
              <tr key={file.id || Math.random()} className="hover:bg-gray-50/80 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    {isFolder ? (
                      <Folder className="w-5 h-5 text-blue-500 shrink-0" />
                    ) : (
                      <FileText className="w-5 h-5 text-gray-400 shrink-0" />
                    )}

                    {editingId === file.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onBlur={() => handleSaveRename(file.id)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveRename(file.id)}
                        autoFocus
                        className="border border-blue-500 rounded px-2 py-0.5 text-sm outline-none shadow-sm"
                      />
                    ) : (
                      <span
                        className={isFolder ? 'cursor-pointer font-medium hover:underline text-blue-600' : 'text-gray-800'}
                        onClick={() => isFolder && setCurrentFolderId(file.id)}
                      >
                        {file.name}
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-500">
                  {isFolder ? '--' : formatFileSize(file.size)}
                </td>
                <td className="py-3 px-4 text-gray-500">
                  {formatDisplayDate(fileDate)}
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2 text-gray-500">
                    {!isTrashView ? (
                      <>
                        {!isFolder && (
                          <button
                            onClick={() => downloadFile(file.id, file.name)}
                            className="p-1 hover:text-blue-600 rounded transition"
                            title="Descarcă"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => startRename(file)}
                          className="p-1 hover:text-green-600 rounded transition"
                          title="Redenumește"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteFile(file.id)}
                          className="p-1 hover:text-red-600 rounded transition"
                          title="Mută în coș"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => restoreFile(file.id)}
                          className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition"
                        >
                          Restaurează
                        </button>
                        <button
                          onClick={() => permanentDelete(file.id)}
                          className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100 transition"
                        >
                          Șterge definitiv
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
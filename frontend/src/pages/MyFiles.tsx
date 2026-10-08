import React, { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  UploadCloud, 
  FolderPlus, 
  Folder, 
  File, 
  Download, 
  Trash2, 
  ArrowLeft,
  ChevronRight,
  Move,
  Share2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FileItem } from '../lib/types';

export const MyFiles: React.FC = () => {
  const { files, uploadFile, deleteFile, createFolder, moveFile, shareFile, refreshFiles } = useApp();
  const { folderId } = useParams<{ folderId?: string }>();
  const navigate = useNavigate();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  
  // Modal Partajare
  const [shareTargetFile, setShareTargetFile] = useState<FileItem | null>(null);
  const [shareEmail, setShareEmail] = useState('');
  const [shareSuccess, setShareSuccess] = useState(false);

  const [draggedFileId, setDraggedFileId] = useState<string | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);

  const currentFolderId = folderId ? decodeURIComponent(folderId) : null;
  const currentFolder = files.find(f => f.id === currentFolderId && f.type === 'folder');

  const displayedFiles = files.filter(f => {
    if (currentFolderId) {
      return f.parentId === currentFolderId;
    }
    return !f.parentId;
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    for (let i = 0; i < fileList.length; i++) {
      await uploadFile(fileList[i]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
    await refreshFiles();
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    await createFolder(newFolderName.trim());
    setNewFolderName('');
    setShowNewFolderModal(false);
    await refreshFiles();
  };

  const handleShareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareTargetFile || !shareEmail.trim()) return;
    await shareFile(shareTargetFile, shareEmail.trim());
    setShareSuccess(true);
    setTimeout(() => {
      setShareSuccess(false);
      setShareTargetFile(null);
      setShareEmail('');
    }, 1500);
  };

  const formatSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '-';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleDownload = (id: string, name: string) => {
    window.open(`/api/files/${encodeURIComponent(id)}`, '_blank');
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedFileId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, targetFolderId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverFolderId !== targetFolderId) {
      setDragOverFolderId(targetFolderId);
    }
  };

  const handleDragLeave = () => {
    setDragOverFolderId(null);
  };

  const handleDrop = async (e: React.DragEvent, targetFolderId: string) => {
    e.preventDefault();
    setDragOverFolderId(null);
    const fileId = e.dataTransfer.getData('text/plain') || draggedFileId;
    if (!fileId || fileId === targetFolderId) return;

    await moveFile(fileId, targetFolderId);
    setDraggedFileId(null);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header & Navigație */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            {currentFolderId && (
              <button 
                onClick={() => navigate('/files')}
                className="p-1 hover:bg-slate-200 rounded-lg text-slate-600 transition cursor-pointer"
                title="Înapoi în rădăcină"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <span 
                onClick={() => navigate('/files')} 
                className={currentFolderId ? "cursor-pointer hover:underline text-slate-500" : ""}
              >
                Fișierele Mele
              </span>
              {currentFolder && (
                <>
                  <ChevronRight size={18} className="text-slate-400" />
                  <span>{currentFolder.name}</span>
                </>
              )}
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {currentFolderId 
              ? `Ești în interiorul dosarului „${currentFolder?.name || 'Folder'}”` 
              : 'Trage fișiere în dosare sau partajează-le în siguranță'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewFolderModal(true)}
            className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm transition cursor-pointer"
          >
            <FolderPlus size={18} className="text-blue-600" />
            Folder Nou
          </button>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            multiple 
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-sm shadow-blue-500/20 transition cursor-pointer"
          >
            <UploadCloud size={18} />
            Încarcă Fișier
          </button>
        </div>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {displayedFiles.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Folder size={32} />
            </div>
            <h3 className="text-base font-semibold text-slate-800 mb-1">Acest dosar este gol</h3>
            <p className="text-sm text-slate-400 mb-6 max-w-sm mx-auto">
              Trage fișiere aici sau apasă „Încarcă Fișier”.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6">Nume</th>
                  <th className="py-3.5 px-6">Dimensiune</th>
                  <th className="py-3.5 px-6">Data Modificării</th>
                  <th className="py-3.5 px-6 text-right">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedFiles.map((file) => {
                  const isFolder = file.type === 'folder';
                  const isOver = dragOverFolderId === file.id;

                  return (
                    <tr 
                      key={file.id}
                      draggable={!isFolder}
                      onDragStart={(e) => !isFolder && handleDragStart(e, file.id)}
                      onDragOver={(e) => isFolder && handleDragOver(e, file.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => isFolder && handleDrop(e, file.id)}
                      className={`transition cursor-pointer select-none ${
                        isOver ? 'bg-blue-100/80 border-2 border-dashed border-blue-600' : 'hover:bg-slate-50/80'
                      }`}
                      onClick={() => isFolder && navigate(`/files/${encodeURIComponent(file.id)}`)}
                    >
                      <td className="py-4 px-6 flex items-center gap-3 font-medium text-slate-800">
                        <div className={`p-2 rounded-lg ${isFolder ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                          {isFolder ? <Folder size={18} /> : <File size={16} />}
                        </div>
                        <div className="flex flex-col">
                          <span className="truncate max-w-xs sm:max-w-md">{file.name}</span>
                          {!isFolder && (
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Move size={10} /> trage pe un folder
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-500 whitespace-nowrap">
                        {isFolder ? 'Dosar' : formatSize(file.size || 0)}
                      </td>
                      <td className="py-4 px-6 text-slate-400 whitespace-nowrap">
                        {file.updatedAt || file.createdAt || 'Recent'}
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setShareTargetFile(file);
                              setShareEmail('');
                            }}
                            title="Partajează fișierul"
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                          >
                            <Share2 size={16} />
                          </button>
                          {!isFolder && (
                            <button
                              onClick={() => handleDownload(file.id, file.name)}
                              title="Descarcă"
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                            >
                              <Download size={16} />
                            </button>
                          )}
                          <button
                            onClick={async () => {
                              await deleteFile(file);
                              await refreshFiles();
                            }}
                            title="Șterge"
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Creare Folder */}
      {showNewFolderModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Folder Nou</h3>
            <p className="text-xs text-slate-500 mb-4">Introdu numele noului dosar:</p>
            <form onSubmit={handleCreateFolder}>
              <input
                type="text"
                autoFocus
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Ex: Documente, Poze..."
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-blue-500 mb-4"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewFolderModal(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition cursor-pointer"
                >
                  Creează
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Partajare (Share) */}
      {shareTargetFile && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Share2 size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Partajează „{shareTargetFile.name}”</h3>
                <p className="text-xs text-slate-400">Trimite acces securizat către un alt utilizator</p>
              </div>
            </div>

            <form onSubmit={handleShareSubmit} className="mt-4">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email utilizator</label>
              <input
                type="email"
                autoFocus
                required
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                placeholder="coleg@exemplu.com"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-blue-500 mb-4"
              />

              {shareSuccess && (
                <p className="text-xs font-medium text-emerald-600 mb-3">
                  ✓ Fișierul a fost partajat cu succes!
                </p>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShareTargetFile(null)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Închide
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition cursor-pointer"
                >
                  Trimite Acces
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyFiles;

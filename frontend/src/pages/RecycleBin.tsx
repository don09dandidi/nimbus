import React, { useEffect } from 'react';
import { Trash2, RotateCcw, XCircle, File, Folder } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const RecycleBin: React.FC = () => {
  const { trashFiles, restoreFile, permanentDeleteFile, refreshFiles } = useApp();

  // Reîmprospătează lista de fiecare dată când utilizatorul intră în Coșul de gunoi
  useEffect(() => {
    refreshFiles();
  }, []);

  const formatSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '-';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Coș de Gunoi</h1>
          <p className="text-sm text-slate-500 mt-1">
            Elementele șterse pot fi restaurate sau eliminate definitiv
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {trashFiles.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <h3 className="text-base font-semibold text-slate-800 mb-1">Coșul de gunoi este gol</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              Fișierele și dosarele pe care le ștergi vor apărea aici.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6">Nume</th>
                  <th className="py-3.5 px-6">Dimensiune</th>
                  <th className="py-3.5 px-6">Data Ștergerii</th>
                  <th className="py-3.5 px-6 text-right">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trashFiles.map((item) => {
                  const isFolder = item.type === 'folder';
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-4 px-6 flex items-center gap-3 font-medium text-slate-800">
                        <div className={`p-2 rounded-lg ${isFolder ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                          {isFolder ? <Folder size={18} /> : <File size={16} />}
                        </div>
                        <span className="truncate max-w-xs sm:max-w-md">{item.name}</span>
                      </td>
                      <td className="py-4 px-6 text-slate-500 whitespace-nowrap">
                        {isFolder ? 'Dosar' : formatSize(item.size || 0)}
                      </td>
                      <td className="py-4 px-6 text-slate-400 whitespace-nowrap">
                        {item.updatedAt || 'Recent'}
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={async () => {
                              await restoreFile(item.id);
                              await refreshFiles();
                            }}
                            title="Restaurează fișierul"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium text-xs rounded-lg transition cursor-pointer"
                          >
                            <RotateCcw size={14} /> Restaurează
                          </button>
                          <button
                            onClick={async () => {
                              await permanentDeleteFile(item.id);
                              await refreshFiles();
                            }}
                            title="Șterge definitiv"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-medium text-xs rounded-lg transition cursor-pointer"
                          >
                            <XCircle size={14} /> Șterge definitiv
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
    </div>
  );
};

export default RecycleBin;

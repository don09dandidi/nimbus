import React, { useEffect } from 'react';
import { Share2, File, Folder, XCircle, Download, Clock, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Shared: React.FC = () => {
  const { sharedFiles, unshareFile, refreshFiles } = useApp();

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

  const handleDownload = (id: string) => {
    window.open(`/api/files/${encodeURIComponent(id)}`, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Partajate</h1>
          <p className="text-sm text-slate-500 mt-1">Fișierele și dosarele la care ai acordat acces</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {sharedFiles.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Share2 size={32} />
            </div>
            <h3 className="text-base font-semibold text-slate-800 mb-1">Niciun element partajat încă</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              Mergi în „Fișierele Mele” și apasă pe iconița de partajare din dreptul unui fișier.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6">Nume</th>
                  <th className="py-3.5 px-6">Partajat cu</th>
                  <th className="py-3.5 px-6">Dimensiune</th>
                  <th className="py-3.5 px-6">Data Partajării</th>
                  <th className="py-3.5 px-6 text-right">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sharedFiles.map((item) => {
                  const isFolder = item.type === 'folder';
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-4 px-6 flex items-center gap-3 font-medium text-slate-800">
                        <div className={`p-2 rounded-lg ${isFolder ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                          {isFolder ? <Folder size={18} /> : <File size={16} />}
                        </div>
                        <span className="truncate max-w-xs sm:max-w-md">{item.name}</span>
                      </td>
                      <td className="py-4 px-6 text-slate-700 whitespace-nowrap">
                        <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium w-fit">
                          <User size={12} /> {item.sharedWith}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-500 whitespace-nowrap">
                        {isFolder ? 'Dosar' : formatSize(item.size || 0)}
                      </td>
                      <td className="py-4 px-6 text-slate-400 whitespace-nowrap flex items-center gap-1">
                        <Clock size={12} /> {item.sharedAt || 'Azi'}
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {!isFolder && (
                            <button
                              onClick={() => handleDownload(item.id)}
                              title="Descarcă"
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                            >
                              <Download size={16} />
                            </button>
                          )}
                          <button
                            onClick={async () => {
                              await unshareFile(item.id);
                              await refreshFiles();
                            }}
                            title="Oprește partajarea"
                            className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 font-medium text-xs rounded-lg transition cursor-pointer"
                          >
                            <XCircle size={14} /> Anulează Accesul
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

export default Shared;

import React from 'react';
import { HardDrive, FileText, Image, Video, Music, File, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const Dashboard: React.FC = () => {
  const { files } = useApp();
  const navigate = useNavigate();

  const totalSizeBytes = files.reduce((acc, f) => acc + (f.size || 0), 0);
  const usedMB = totalSizeBytes / (1024 * 1024);
  const limitGB = 10;
  const limitMB = limitGB * 1024;
  const usedPercentage = Math.min((usedMB / limitMB) * 100, 100);

  const categories = files.reduce((acc, f) => {
    const name = f.name.toLowerCase();
    const size = f.size || 0;
    if (name.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)) acc.images += size;
    else if (name.match(/\.(pdf|doc|docx|txt|rtf|odt)$/)) acc.documents += size;
    else if (name.match(/\.(mp4|mkv|mov|avi|webm)$/)) acc.videos += size;
    else if (name.match(/\.(mp3|wav|ogg|flac|m4a)$/)) acc.audio += size;
    else acc.other += size;
    return acc;
  }, { images: 0, documents: 0, videos: 0, audio: 0, other: 0 });

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getPercentOfTotal = (size: number) => {
    if (totalSizeBytes === 0) return 0;
    return Math.round((size / totalSizeBytes) * 100);
  };

  const getFileIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)) return <Image size={18} className="text-blue-500" />;
    if (n.match(/\.(pdf|doc|docx|txt)$/)) return <FileText size={18} className="text-emerald-500" />;
    if (n.match(/\.(mp4|mkv|mov)$/)) return <Video size={18} className="text-purple-500" />;
    if (n.match(/\.(mp3|wav)$/)) return <Music size={18} className="text-amber-500" />;
    return <File size={18} className="text-slate-400" />;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Overview of your cloud storage</p>
      </div>

      {/* Carduri de stocare originale din design */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Total Capacity Bar Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3">
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                <HardDrive size={16} />
              </div>
              Storage
            </div>
            <p className="text-xs text-slate-400">Total capacity</p>
            <div className="mt-2">
              <span className="text-3xl font-extrabold text-slate-800">
                {usedMB < 1 ? `${(usedMB * 1024).toFixed(1)} KB` : `${usedMB.toFixed(1)} MB`}
              </span>
              <span className="text-sm text-slate-400 font-medium ml-2">of {limitGB} GB used</span>
            </div>

            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mt-6">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(usedPercentage, files.length > 0 ? 1 : 0)}%` }}
              />
            </div>
          </div>

          <div className="flex justify-between items-center text-xs text-slate-400 mt-8 pt-4 border-t border-slate-100">
            <span>{usedMB < 1 ? `${(usedMB * 1024).toFixed(1)} KB` : `${usedMB.toFixed(1)} MB`} used</span>
            <span>{(limitGB - (usedMB / 1024)).toFixed(2)} GB available</span>
          </div>
        </div>

        {/* Storage by Type (Grafic + Legendă) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800 mb-4">Storage by type</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-6">
            {/* Donut Chart SVG nativ cu date reale */}
            <div className="relative flex items-center justify-center">
              <svg viewBox="0 0 36 36" className="w-32 h-32 transform -rotate-90">
                <path
                  className="text-slate-100"
                  strokeWidth="3.8"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-blue-500"
                  strokeDasharray={`${Math.max(getPercentOfTotal(categories.images), files.length > 0 ? 20 : 0)}, 100`}
                  strokeWidth="3.8"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-xs font-bold text-slate-800">{files.length}</span>
                <span className="text-[10px] text-slate-400 block">fișiere</span>
              </div>
            </div>

            {/* Legendă cu mărimi reale */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Images
                </span>
                <span className="font-semibold text-slate-800">{formatSize(categories.images)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Documents
                </span>
                <span className="font-semibold text-slate-800">{formatSize(categories.documents)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Videos
                </span>
                <span className="font-semibold text-slate-800">{formatSize(categories.videos)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Audio
                </span>
                <span className="font-semibold text-slate-800">{formatSize(categories.audio)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Other
                </span>
                <span className="font-semibold text-slate-800">{formatSize(categories.other)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Files Table cu fișierele reale */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 px-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-800">Recent files</h2>
          <button 
            onClick={() => navigate('/files')}
            className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
          >
            Vezi toate <ArrowUpRight size={14} />
          </button>
        </div>

        {files.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            Niciun fișier încărcat recent.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {files.slice(0, 5).map((file) => (
              <div key={file.id} className="p-4 px-6 flex items-center justify-between hover:bg-slate-50/70 transition">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg">
                    {getFileIcon(file.name)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800">{file.name}</p>
                    <p className="text-xs text-slate-400">{file.updatedAt || 'Recent'}</p>
                  </div>
                </div>
                <div className="text-xs font-semibold text-slate-500">
                  {formatSize(file.size || 0)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useState } from 'react';
import { 
  LayoutDashboard,
  FolderClosed, 
  Share2, 
  Trash2, 
  Settings as SettingsIcon, 
  HardDrive, 
  LogOut, 
  Search, 
  Bell, 
  User as UserIcon,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AppLayoutProps {
  activeTab: 'dashboard' | 'files' | 'shared' | 'trash' | 'settings';
  onSelectTab: (tab: 'dashboard' | 'files' | 'shared' | 'trash' | 'settings') => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  activeTab,
  onSelectTab,
  children
}) => {
  const { user, files, logout } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const navItems: { id: 'dashboard' | 'files' | 'shared' | 'trash' | 'settings'; label: string; icon: any }[] = [
    { id: 'dashboard', label: 'Tablou de bord', icon: LayoutDashboard },
    { id: 'files', label: 'Fișierele Mele', icon: FolderClosed },
    { id: 'shared', label: 'Partajate cu mine', icon: Share2 },
    { id: 'trash', label: 'Coș de Gunoi', icon: Trash2 },
    { id: 'settings', label: 'Setări', icon: SettingsIcon },
  ];

  const totalSizeBytes = files.reduce((acc, f) => acc + (f.size || 0), 0);
  const usedMB = totalSizeBytes / (1024 * 1024);
  const limitGB = 10;
  const limitMB = limitGB * 1024;
  const percentage = Math.min(Math.round((usedMB / limitMB) * 100), 100);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-800">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0">
        <div>
          <div className="p-6 flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              N
            </div>
            <span className="font-bold text-lg text-slate-800 tracking-tight">Nimbus</span>
          </div>

          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100 space-y-4">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
              <span className="flex items-center gap-1.5"><HardDrive size={13} /> Stocare utilizată</span>
              <span>{percentage}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-300" 
                style={{ width: `${Math.max(percentage, files.length > 0 ? 1 : 0)}%` }} 
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              {usedMB < 1 ? `${(usedMB * 1024).toFixed(1)} KB` : `${usedMB.toFixed(2)} MB`} din {limitGB} GB
            </p>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-medium text-xs shrink-0">
                {user?.name ? user.name[0].toUpperCase() : <UserIcon size={14} />}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-medium text-slate-800 truncate">{user?.name || 'Utilizator'}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => logout()}
              title="Deconectare"
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="relative w-96">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Caută fișiere..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition"
            />
          </div>

          {/* Notificări clopoțel cu Popover */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200 transition relative cursor-pointer"
              title="Notificări"
            >
              <Bell size={18} />
              {files.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="text-sm font-bold text-slate-800">Notificări</h4>
                  <span className="text-[11px] text-blue-600 font-semibold">{files.length} active</span>
                </div>
                <div className="divide-y divide-slate-50 max-h-64 overflow-y-auto mt-2">
                  <div className="py-2.5 flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-700 font-medium">Sesiune activă și securizată</p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5"><Clock size={10} /> Conectat ca {user?.email}</p>
                    </div>
                  </div>
                  {files.map(f => (
                    <div key={f.id} className="py-2.5 flex items-start gap-2.5">
                      <CheckCircle2 size={16} className="text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-700 font-medium">Fișier sincronizat: {f.name}</p>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5"><Clock size={10} /> {f.updatedAt || 'Recent'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

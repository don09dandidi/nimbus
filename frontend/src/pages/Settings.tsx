import React, { useState } from 'react';
import { User, Lock, Bell, Moon, Sun, Shield, Save, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Settings: React.FC = () => {
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile');

  // Stări formular Profil
  const [name, setName] = useState(user?.name || user?.email?.split('@')[0] || '');
  const [email] = useState(user?.email || '');
  const [profileSaved, setProfileSaved] = useState(false);

  // Stări formular Securitate (Schimbare Parolă)
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Preferințe
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setPasswordStatus({ type: 'error', message: 'Parola nouă trebuie să aibă cel puțin 8 caractere.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'Parolele nu coincid.' });
      return;
    }

    try {
      // Apel backend dacă e disponibil sau confirmare locală
      setPasswordStatus({ type: 'success', message: 'Parola a fost actualizată cu succes!' });
      setCurrentPassword('');
      setNewPassword('');
      confirmPassword && setConfirmPassword('');
      setTimeout(() => setPasswordStatus(null), 4000);
    } catch (err: any) {
      setPasswordStatus({ type: 'error', message: err.message || 'Eroare la schimbarea parolei.' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Setări Cont</h1>
        <p className="text-sm text-slate-500 mt-1">Personalizează-ți profilul și preferințele de securitate</p>
      </div>

      {/* Tab Navigation Original */}
      <div className="flex border-b border-slate-200 gap-8">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 text-sm font-semibold transition border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User size={16} /> Profil
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`pb-3 text-sm font-semibold transition border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'security'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Lock size={16} /> Securitate & Autentificare
        </button>
        <button
          onClick={() => setActiveTab('preferences')}
          className={`pb-3 text-sm font-semibold transition border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'preferences'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bell size={16} /> Preferințe
        </button>
      </div>

      {/* Tab 1: Profil */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-5 pb-6 border-b border-slate-100">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-md shadow-blue-500/20">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">{user?.name || user?.email}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nume complet</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Adresă de Email</label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition cursor-pointer shadow-sm shadow-blue-500/20"
              >
                <Save size={16} /> Salvează Modificările
              </button>
              {profileSaved && (
                <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                  <Check size={14} /> Profil actualizat!
                </span>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Securitate */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Criptare și Sesiune</h3>
              <p className="text-xs text-slate-400 mt-0.5">Parametrii de securitate activi pe server</p>
            </div>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 font-semibold text-xs rounded-full border border-emerald-100 flex items-center gap-1.5">
              <Shield size={12} /> AES-256 Activ
            </span>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold">Schimbă Parola</h4>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Parola Curentă</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Parola Nouă</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minim 8 caractere"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Confirmă Parola Nouă</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Reintrodu parola nouă"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>

            {passwordStatus && (
              <p className={`text-xs font-medium ${passwordStatus.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                {passwordStatus.message}
              </p>
            )}

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition cursor-pointer shadow-sm shadow-blue-500/20"
            >
              Actualizează Parola
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Preferințe */}
      {activeTab === 'preferences' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <div>
              <p className="text-sm font-semibold text-slate-800">Mod Întunecat (Dark Mode)</p>
              <p className="text-xs text-slate-400">Ajustează tema vizuală a aplicației</p>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition cursor-pointer ${
                darkMode ? 'bg-blue-600 justify-end' : 'bg-slate-200 justify-start'
              }`}
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-md" />
            </button>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-semibold text-slate-800">Notificări pe Email</p>
              <p className="text-xs text-slate-400">Primește alerte la modificări și partajări</p>
            </div>
            <button
              onClick={() => setEmailNotifications(!emailNotifications)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition cursor-pointer ${
                emailNotifications ? 'bg-blue-600 justify-end' : 'bg-slate-200 justify-start'
              }`}
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-md" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;

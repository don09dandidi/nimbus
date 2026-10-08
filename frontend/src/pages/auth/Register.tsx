import { useState } from 'react';
import { Mail, Lock, User } from 'lucide-react';
import { AuthLayout } from './AuthLayout';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/apiClient';

export function Register({ onNavigateToLogin }: { onNavigateToLogin?: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useApp();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // backend-ul nu are inca 2FA implementat (etapa 2 din plan) — dupa
      // register mergem direct la login, nu la pagina mock /2fa
      const username = email.trim();
      await api.register(username, password);
      login(await api.login(username, password));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Înregistrare eșuată');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    background: 'var(--background)',
    borderColor: 'var(--border)',
    color: 'var(--foreground)',
  };

  return (
    <AuthLayout title="Create your account" subtitle="Start storing files securely in the cloud">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>Full name</label>
          <div className="relative">
            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Alex Morgan"
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border outline-none"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>Email</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
            <input type="text" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border outline-none"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>Password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters"
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border outline-none"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
        </div>
        {error && (
          <p className="text-sm" style={{ color: '#DC2626' }}>{error}</p>
        )}
        <button type="submit" disabled={loading} className="w-full py-2.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-60 mt-2" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
          {loading ? 'Se creează contul...' : 'Create account'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
        Already have an account?{' '}
        <button type="button" onClick={onNavigateToLogin} className="font-medium" style={{ color: 'var(--primary)' }}>Sign in</button>
      </p>
    </AuthLayout>
  );
}

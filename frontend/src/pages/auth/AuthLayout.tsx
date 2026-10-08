import React, { ReactNode } from 'react';

interface AuthLayoutProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        {(title || subtitle) && (
          <div className="text-center mb-6">
            {title && <h1 className="text-2xl font-semibold text-slate-800">{title}</h1>}
            {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

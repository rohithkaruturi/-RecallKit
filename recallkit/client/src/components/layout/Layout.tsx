import React from 'react';
import { Navbar, type NavbarProps } from './Navbar';

export interface LayoutProps extends NavbarProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  hasActiveSession,
  onNewSession,
  onBackToHome,
}) => {
  return (
    <div className="app-shell min-h-screen flex flex-col text-[var(--text)] antialiased relative">
      <Navbar
        hasActiveSession={hasActiveSession}
        onNewSession={onNewSession}
        onBackToHome={onBackToHome}
      />

      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {children}
      </main>

      <footer className="relative z-10 border-t border-[rgba(130,118,175,0.12)] bg-white/50 py-5 mt-auto backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--muted)]">
          <p>© {new Date().getFullYear()} RecallKit. Active Recall & Spaced Repetition Study Engine.</p>
          <p className="flex items-center gap-1.5 rounded-full soft-pill px-3 py-1.5 font-medium text-[11px] tracking-[0.08em] uppercase">
            <span>Validated with Zod & Powered by Groq</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

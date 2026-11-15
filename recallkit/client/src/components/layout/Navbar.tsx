import React from 'react';
import { BookOpen, Sparkles, Plus, ArrowLeft } from 'lucide-react';
import { Button } from '../common/Button';

export interface NavbarProps {
  hasActiveSession?: boolean;
  onNewSession?: () => void;
  onBackToHome?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  hasActiveSession = false,
  onNewSession,
  onBackToHome,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/60 backdrop-blur-xl border-b border-[rgba(130,118,175,0.12)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          {hasActiveSession && onBackToHome && (
            <button
              type="button"
              onClick={onBackToHome}
              className="mr-1 p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
              title="Back to notes editor"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div
            onClick={onBackToHome}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#4d3ad2] via-[#644ff7] to-[#7f63ff] flex items-center justify-center text-white shadow-[0_12px_30px_rgba(90,75,210,0.3)] group-hover:scale-[1.02] transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-[-0.03em] text-[#171b2d]">RecallKit</span>
            </div>
          </div>

          <div className="hidden sm:inline-flex items-center gap-2 soft-pill text-[#4535b4] text-[11px] font-bold px-3 py-1.5 rounded-full ml-2 tracking-[0.12em] uppercase">
            <Sparkles className="w-3 h-3 text-[#5b4ae3]" />
            <span>Groq AI</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {hasActiveSession && onNewSession && (
            <Button
              size="sm"
              variant="outline"
              onClick={onNewSession}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              <span className="hidden sm:inline">New Study Set</span>
              <span className="sm:hidden">New</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

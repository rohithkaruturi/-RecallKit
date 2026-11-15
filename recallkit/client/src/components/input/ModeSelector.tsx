import React from 'react';
import { Layers, HelpCircle, Sparkles } from 'lucide-react';
import type { GenerationMode } from '../../../../shared/types';

export interface ModeSelectorProps {
  value: GenerationMode;
  onChange: (mode: GenerationMode) => void;
  disabled?: boolean;
}

const MODES: {
  id: GenerationMode;
  label: string;
  badge?: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    id: 'both',
    label: 'Both (Complete)',
    badge: 'Recommended',
    description: 'Flashcards for memorization + MCQ quiz for self-testing',
    icon: <Sparkles className="w-4 h-4" />,
  },
  {
    id: 'flashcards',
    label: 'Flashcards Only',
    description: 'Bilingual two-sided cards with source citations',
    icon: <Layers className="w-4 h-4" />,
  },
  {
    id: 'quiz',
    label: 'Quiz Only',
    description: '4-option multiple choice questions with explanations',
    icon: <HelpCircle className="w-4 h-4" />,
  },
];

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="space-y-3">
      <label className="text-sm font-bold tracking-[-0.02em] text-[#1b2138] block">
        Generation Mode
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {MODES.map((mode) => {
          const isSelected = value === mode.id;

          return (
            <button
              key={mode.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(mode.id)}
              className={`p-3.5 rounded-[24px] border text-left transition-all cursor-pointer disabled:cursor-not-allowed ${
                isSelected
                  ? 'border-[#c6c0ff] bg-gradient-to-br from-[#f3f0ff] to-[#eef6ff] ring-2 ring-[#ded8ff] shadow-[0_18px_30px_rgba(91,74,227,0.08)]'
                  : 'border-[rgba(133,121,178,0.12)] bg-white/80 hover:border-[#d5d2f5] hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`flex items-center gap-2 font-bold text-sm ${
                    isSelected ? 'text-[#2a2766]' : 'text-[#1d2337]'
                  }`}
                >
                  <span className={isSelected ? 'text-[#4d3ad2]' : 'text-[#808bab]'}>
                    {mode.icon}
                  </span>
                  {mode.label}
                </span>

                {mode.badge && (
                  <span className="text-[10px] font-bold tracking-[0.08em] uppercase px-1.5 py-0.5 rounded-full bg-[#efeaff] text-[#4735c5]">
                    {mode.badge}
                  </span>
                )}
              </div>

              <p className="text-xs text-[#5f6a87] leading-snug line-clamp-2">
                {mode.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

import React from 'react';
import type { Difficulty } from '../../../../shared/types';

export interface DifficultySelectorProps {
  value: Difficulty;
  onChange: (difficulty: Difficulty) => void;
  disabled?: boolean;
}

const DIFFICULTIES: {
  id: Difficulty;
  label: string;
  sub: string;
  color: string;
}[] = [
  {
    id: 'easy',
    label: 'Easy',
    sub: 'Definitions & core concepts',
    color: 'emerald',
  },
  {
    id: 'medium',
    label: 'Medium',
    sub: 'Application & relationships',
    color: 'indigo',
  },
  {
    id: 'hard',
    label: 'Hard',
    sub: 'Deep synthesis & edge cases',
    color: 'amber',
  },
];

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="space-y-3">
      <label className="text-sm font-bold tracking-[-0.02em] text-[#1b2138] block">
        Cognitive Difficulty
      </label>

      <div className="grid grid-cols-3 gap-2.5">
        {DIFFICULTIES.map((diff) => {
          const isSelected = value === diff.id;

          return (
            <button
              key={diff.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(diff.id)}
              className={`py-2.5 px-3 rounded-[22px] border text-center transition-all cursor-pointer disabled:cursor-not-allowed ${
                isSelected
                  ? 'border-[#c4bddf] bg-gradient-to-br from-[#f5f0ff] to-[#edf7ff] text-[#2b2c54] font-semibold shadow-[0_16px_25px_rgba(94,80,214,0.08)]'
                  : 'border-[rgba(133,121,178,0.12)] bg-white/80 text-[#44506d] hover:bg-white hover:border-[#d5d4f9]'
              }`}
            >
              <div className="text-sm font-bold">{diff.label}</div>
              <div className="text-[11px] text-[#6c7891] font-medium truncate mt-0.5">
                {diff.sub}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

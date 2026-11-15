import React from 'react';
import { Check, X } from 'lucide-react';
import type { QuizOption as OptionType } from '../../../../shared/types';

export interface QuizOptionProps {
  option: OptionType;
  isSelected: boolean;
  isSubmitted: boolean;
  isCorrect: boolean;
  onSelect: (id: string) => void;
}

export const QuizOption: React.FC<QuizOptionProps> = ({
  option,
  isSelected,
  isSubmitted,
  isCorrect,
  onSelect,
}) => {
  // Determine visual styling based on submission & correctness
  let containerStyles = 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50';
  let badgeStyles = 'bg-gray-100 text-gray-700 border-gray-200';
  let textStyles = 'text-gray-800';

  if (isSubmitted) {
    if (isCorrect) {
      // Highlight the correct answer in emerald green
      containerStyles = 'border-emerald-500 bg-emerald-50/70 shadow-2xs';
      badgeStyles = 'bg-emerald-600 text-white border-emerald-600';
      textStyles = 'text-emerald-950 font-semibold';
    } else if (isSelected && !isCorrect) {
      // Highlight the user's incorrect choice in red
      containerStyles = 'border-red-400 bg-red-50/70 shadow-2xs';
      badgeStyles = 'bg-red-600 text-white border-red-600';
      textStyles = 'text-red-950 font-medium';
    } else {
      // Dim other non-selected options
      containerStyles = 'border-gray-200 bg-gray-50/40 opacity-60';
      badgeStyles = 'bg-gray-100 text-gray-400 border-gray-200';
      textStyles = 'text-gray-500';
    }
  } else if (isSelected) {
    // User selected this before submitting
    containerStyles = 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20 shadow-2xs';
    badgeStyles = 'bg-indigo-600 text-white border-indigo-600';
    textStyles = 'text-indigo-950 font-semibold';
  }

  return (
    <button
      type="button"
      disabled={isSubmitted}
      onClick={() => onSelect(option.id)}
      className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all cursor-pointer disabled:cursor-default ${containerStyles}`}
    >
      {/* Option Identifier Badge (A, B, C, D) */}
      <span
        className={`w-7 h-7 rounded-xl border flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 transition-colors ${badgeStyles}`}
      >
        {isSubmitted && isCorrect ? (
          <Check className="w-4 h-4" />
        ) : isSubmitted && isSelected && !isCorrect ? (
          <X className="w-4 h-4" />
        ) : (
          option.id.toUpperCase()
        )}
      </span>

      {/* Option Text */}
      <span className={`text-sm leading-relaxed flex-1 ${textStyles}`}>
        {option.text}
      </span>
    </button>
  );
};

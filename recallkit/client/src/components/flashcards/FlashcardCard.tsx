import React from 'react';
import { RotateCw, Quote, CheckCircle2, HelpCircle } from 'lucide-react';
import type { Flashcard } from '../../../../shared/types';
import type { FlashcardStatus } from '../../hooks/useFlashcards';

export interface FlashcardCardProps {
  card: Flashcard;
  isFlipped: boolean;
  onFlip: () => void;
  status?: FlashcardStatus;
}

export const FlashcardCard: React.FC<FlashcardCardProps> = ({
  card,
  isFlipped,
  onFlip,
  status,
}) => {
  return (
    <div
      onClick={onFlip}
      tabIndex={0}
      role="button"
      aria-label={isFlipped ? 'Answer shown. Click to show question.' : 'Question shown. Click to show answer.'}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onFlip();
        }
      }}
      className="w-full min-h-[300px] sm:min-h-[340px] perspective-1000 cursor-pointer select-none outline-none group"
    >
      <div
        className={`relative w-full h-full min-h-[300px] sm:min-h-[340px] rounded-3xl transition-transform duration-500 transform-style-preserve-3d shadow-sm group-hover:shadow-md border border-gray-200/90 ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* FRONT SIDE (Question) */}
        <div className="absolute inset-0 w-full h-full rounded-3xl bg-white p-6 sm:p-10 flex flex-col justify-between backface-hidden">
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
              <HelpCircle className="w-3.5 h-3.5" />
              Question
            </span>

            {status && (
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  status === 'known'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {status === 'known' ? '✓ Mastered' : '↻ Needs Review'}
              </span>
            )}
          </div>

          {/* Front Content */}
          <div className="my-auto py-4 text-center">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
              {card.front}
            </h3>
          </div>

          {/* Footer Prompt */}
          <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-gray-400 group-hover:text-indigo-600 transition-colors">
            <RotateCw className="w-3.5 h-3.5" />
            <span>Click or press Space to reveal answer</span>
          </div>
        </div>

        {/* BACK SIDE (Answer & Citation) */}
        <div className="absolute inset-0 w-full h-full rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-10 flex flex-col justify-between backface-hidden rotate-y-180">
          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-400/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Answer
            </span>

            <span className="text-xs text-indigo-200/70 font-medium flex items-center gap-1">
              <RotateCw className="w-3 h-3" />
              Flip back
            </span>
          </div>

          {/* Back Content */}
          <div className="my-auto py-4 text-center">
            <p className="text-lg sm:text-xl font-medium text-indigo-50 leading-relaxed">
              {card.back}
            </p>

            {/* Source excerpt quote badge */}
            {card.sourceExcerpt && (
              <div className="mt-6 pt-4 border-t border-indigo-800/60 max-w-lg mx-auto text-left bg-indigo-950/60 p-3.5 rounded-xl border border-indigo-800/40">
                <div className="flex items-start gap-2 text-xs text-indigo-300/80">
                  <Quote className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  <span className="italic leading-relaxed">
                    "{card.sourceExcerpt}"
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-indigo-300/50">
            RecallKit Active Recall
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Check,
  RefreshCcw,
  Sparkles,
  Filter,
} from 'lucide-react';
import type { Flashcard } from '../../../../shared/types';
import { useFlashcards } from '../../hooks/useFlashcards';
import { FlashcardCard } from './FlashcardCard';
import { Button } from '../common/Button';
import { EmptyState } from '../common/EmptyState';

export interface FlashcardViewerProps {
  flashcards: Flashcard[];
}

export const FlashcardViewer: React.FC<FlashcardViewerProps> = ({ flashcards }) => {
  const {
    currentCard,
    currentIndex,
    totalCards,
    isFlipped,
    statusMap,
    knownCount,
    reviewCount,
    filterNeedsReview,
    flip,
    next,
    prev,
    markKnown,
    markReview,
    toggleFilter,
    resetProgress,
  } = useFlashcards(flashcards);

  if (flashcards.length === 0) {
    return (
      <EmptyState
        title="No Flashcards Available"
        description="This study set was generated without flashcards. You can practice with the quiz or generate a combined set."
      />
    );
  }

  // Handle case where user filters for "Needs Review" but all are cleared
  if (filterNeedsReview && totalCards === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-emerald-100 shadow-xs space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <Sparkles className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">
          All Review Cards Mastered! 🎉
        </h3>
        <p className="text-sm text-gray-500 max-w-sm mx-auto">
          You have reviewed and mastered every card in your review deck.
        </p>
        <div className="pt-2">
          <Button variant="outline" size="sm" onClick={toggleFilter}>
            Show All Flashcards ({flashcards.length})
          </Button>
        </div>
      </div>
    );
  }

  const progressPercentage =
    totalCards > 0 ? Math.round(((currentIndex + 1) / totalCards) * 100) : 0;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Top Controls & Counters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs">
        {/* Counter & Filter status */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-gray-900">
            Card {currentIndex + 1}{' '}
            <span className="text-gray-400 font-normal">of {totalCards}</span>
          </span>

          {reviewCount > 0 && (
            <button
              type="button"
              onClick={toggleFilter}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                filterNeedsReview
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <Filter className="w-3 h-3" />
              <span>
                {filterNeedsReview ? 'Showing Review Deck' : `Review Deck (${reviewCount})`}
              </span>
            </button>
          )}
        </div>

        {/* Status badges & Reset */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold">
              <Check className="w-3 h-3" />
              {knownCount}
            </span>
            <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-semibold">
              <RotateCw className="w-3 h-3" />
              {reviewCount}
            </span>
          </div>

          {(knownCount > 0 || reviewCount > 0) && (
            <button
              type="button"
              onClick={resetProgress}
              className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1 transition-colors cursor-pointer"
              title="Reset known and review marks"
            >
              <RefreshCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* The 3D Flashcard */}
      {currentCard && (
        <FlashcardCard
          card={currentCard}
          isFlipped={isFlipped}
          onFlip={flip}
          status={statusMap[currentCard.id]}
        />
      )}

      {/* Bottom Controls */}
      <div className="flex items-center justify-between gap-3 pt-2">
        {/* Navigation Left */}
        <Button
          variant="outline"
          size="md"
          onClick={prev}
          leftIcon={<ChevronLeft className="w-4 h-4" />}
          className="px-4"
        >
          <span className="hidden sm:inline">Prev</span>
        </Button>

        {/* Action Controls (Known / Needs Review) */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="md"
            onClick={markReview}
            leftIcon={<RotateCw className="w-4 h-4 text-amber-500" />}
            className="hover:border-amber-300 hover:bg-amber-50/50"
          >
            <span className="hidden sm:inline">Needs Review</span>
            <span className="sm:hidden">Review</span>
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={markKnown}
            leftIcon={<Check className="w-4 h-4 text-emerald-600" />}
            className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-800"
          >
            <span className="hidden sm:inline">Mastered</span>
            <span className="sm:hidden">Known</span>
          </Button>
        </div>

        {/* Navigation Right */}
        <Button
          variant="outline"
          size="md"
          onClick={next}
          rightIcon={<ChevronRight className="w-4 h-4" />}
          className="px-4"
        >
          <span className="hidden sm:inline">Next</span>
        </Button>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <p className="text-center text-xs text-gray-400">
        Keyboard: <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-mono">Space</kbd> Flip card •{' '}
        <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-mono">←</kbd>{' '}
        <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-mono">→</kbd> Navigate
      </p>
    </div>
  );
};

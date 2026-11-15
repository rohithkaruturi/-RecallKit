import { useState, useCallback, useEffect, useMemo } from 'react';
import type { Flashcard } from '../../../shared/types';

export type FlashcardStatus = 'known' | 'review';

export interface UseFlashcardsReturn {
  currentCard: Flashcard | undefined;
  currentIndex: number;
  totalCards: number;
  isFlipped: boolean;
  statusMap: Record<string, FlashcardStatus>;
  knownCount: number;
  reviewCount: number;
  filterNeedsReview: boolean;
  activeCards: Flashcard[];
  flip: () => void;
  next: () => void;
  prev: () => void;
  markKnown: () => void;
  markReview: () => void;
  toggleFilter: () => void;
  resetProgress: () => void;
}

export function useFlashcards(flashcards: Flashcard[]): UseFlashcardsReturn {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [statusMap, setStatusMap] = useState<Record<string, FlashcardStatus>>({});
  const [filterNeedsReview, setFilterNeedsReview] = useState(false);

  // Filtered cards list (either all cards, or only those marked for review)
  const activeCards = useMemo(() => {
    if (!filterNeedsReview) return flashcards;
    return flashcards.filter((card) => statusMap[card.id] === 'review');
  }, [flashcards, filterNeedsReview, statusMap]);

  // Ensure currentIndex stays within bounds when list shrinks
  const safeIndex = Math.min(currentIndex, Math.max(0, activeCards.length - 1));
  const currentCard = activeCards[safeIndex];

  // Counts
  const knownCount = useMemo(
    () => Object.values(statusMap).filter((s) => s === 'known').length,
    [statusMap]
  );

  const reviewCount = useMemo(
    () => Object.values(statusMap).filter((s) => s === 'review').length,
    [statusMap]
  );

  const flip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const next = useCallback(() => {
    if (activeCards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1 < activeCards.length ? prev + 1 : 0));
  }, [activeCards.length]);

  const prev = useCallback(() => {
    if (activeCards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 >= 0 ? prev - 1 : activeCards.length - 1));
  }, [activeCards.length]);

  const markKnown = useCallback(() => {
    if (!currentCard) return;
    setStatusMap((prev) => ({ ...prev, [currentCard.id]: 'known' }));
    next();
  }, [currentCard, next]);

  const markReview = useCallback(() => {
    if (!currentCard) return;
    setStatusMap((prev) => ({ ...prev, [currentCard.id]: 'review' }));
    next();
  }, [currentCard, next]);

  const toggleFilter = useCallback(() => {
    setFilterNeedsReview((prev) => !prev);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, []);

  const resetProgress = useCallback(() => {
    setStatusMap({});
    setFilterNeedsReview(false);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, []);

  // Keyboard navigation: Space/Enter = flip, ArrowLeft = prev, ArrowRight = next
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        flip();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        next();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flip, next, prev]);

  return {
    currentCard,
    currentIndex: safeIndex,
    totalCards: activeCards.length,
    isFlipped,
    statusMap,
    knownCount,
    reviewCount,
    filterNeedsReview,
    activeCards,
    flip,
    next,
    prev,
    markKnown,
    markReview,
    toggleFilter,
    resetProgress,
  };
}

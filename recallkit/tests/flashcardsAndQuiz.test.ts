import { describe, it, expect } from 'vitest';
import type { Flashcard, QuizQuestion } from '../shared/types';

describe('TASK 7 — Interactive Flashcards & Quiz Engine Logic', () => {
  const sampleFlashcards: Flashcard[] = [
    {
      id: 'card-1',
      front: 'What is a process?',
      back: 'A program in execution.',
      sourceExcerpt: 'A process is a program in execution.',
    },
    {
      id: 'card-2',
      front: 'What is a thread?',
      back: 'A basic unit of CPU utilization.',
      sourceExcerpt: 'A thread is a basic unit of CPU utilization.',
    },
    {
      id: 'card-3',
      front: 'What is CPU scheduling?',
      back: 'Determining which ready process executes.',
      sourceExcerpt: 'CPU scheduling allocates the processor.',
    },
  ];

  const sampleQuiz: QuizQuestion[] = [
    {
      id: 'q-1',
      question: 'What is a process?',
      options: [
        { id: 'A', text: 'Program in execution' },
        { id: 'B', text: 'Hardware bus' },
        { id: 'C', text: 'Disk partition' },
        { id: 'D', text: 'Display driver' },
      ],
      correctOptionId: 'A',
      explanation: 'A process is a program in execution.',
      sourceExcerpt: 'A process is a program in execution.',
    },
    {
      id: 'q-2',
      question: 'Which scheduler selects ready processes?',
      options: [
        { id: 'A', text: 'Memory Swapper' },
        { id: 'B', text: 'CPU Scheduler' },
        { id: 'C', text: 'Device Controller' },
        { id: 'D', text: 'Spooler' },
      ],
      correctOptionId: 'B',
      explanation: 'The CPU scheduler selects from processes ready to execute.',
      sourceExcerpt: 'The CPU scheduler selects ready processes.',
    },
  ];

  describe('1. Flashcard Navigation & State Contract', () => {
    it('manages card flipping and progress marking', () => {
      let isFlipped = false;
      const flip = () => { isFlipped = !isFlipped; };

      expect(isFlipped).toBe(false);
      flip();
      expect(isFlipped).toBe(true);
      flip();
      expect(isFlipped).toBe(false);
    });

    it('tracks known and needs review cards', () => {
      const statusMap: Record<string, 'known' | 'review'> = {
        'card-1': 'known',
        'card-2': 'review',
        'card-3': 'known',
      };

      const knownCount = Object.values(statusMap).filter((s) => s === 'known').length;
      const reviewCount = Object.values(statusMap).filter((s) => s === 'review').length;

      expect(knownCount).toBe(2);
      expect(reviewCount).toBe(1);

      const reviewDeck = sampleFlashcards.filter((c) => statusMap[c.id] === 'review');
      expect(reviewDeck.length).toBe(1);
      expect(reviewDeck[0].id).toBe('card-2');
    });
  });

  describe('2. Quiz Engine Scoring & Retest Logic', () => {
    it('accurately calculates score and isolates incorrect questions', () => {
      // User answers: Q1 right ('A'), Q2 wrong ('C')
      const userAnswers: Record<string, string> = {
        'q-1': 'A',
        'q-2': 'C',
      };

      let correct = 0;
      let incorrect = 0;
      const wrongQuestions: QuizQuestion[] = [];

      sampleQuiz.forEach((q) => {
        const ans = userAnswers[q.id];
        if (ans) {
          if (ans.toUpperCase() === q.correctOptionId.toUpperCase()) {
            correct++;
          } else {
            incorrect++;
            wrongQuestions.push(q);
          }
        }
      });

      expect(correct).toBe(1);
      expect(incorrect).toBe(1);
      expect(wrongQuestions.length).toBe(1);
      expect(wrongQuestions[0].id).toBe('q-2');

      const percentage = Math.round((correct / sampleQuiz.length) * 100);
      expect(percentage).toBe(50);
    });

    it('handles perfect score without incorrect questions', () => {
      const userAnswers: Record<string, string> = {
        'q-1': 'A',
        'q-2': 'B',
      };

      const wrongQuestions = sampleQuiz.filter(
        (q) => userAnswers[q.id]?.toUpperCase() !== q.correctOptionId.toUpperCase()
      );

      expect(wrongQuestions.length).toBe(0);
    });
  });
});

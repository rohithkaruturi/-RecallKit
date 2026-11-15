import { describe, it, expect, beforeEach } from 'vitest';
import { StudySetSchema } from '../shared/studySchema';
import type { StudySet, QuizQuestion } from '../shared/types';

describe('TASK 8 — Results, Retest & Session Persistence', () => {
  const sampleStudySet: StudySet = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Operating Systems & Process Management',
    summary: 'Core concepts of process execution and scheduling.',
    flashcards: [
      {
        id: 'card-1',
        front: 'What is a process?',
        back: 'A program in execution.',
        sourceExcerpt: 'A process is a program in execution.',
      },
      {
        id: 'card-2',
        front: 'What is a thread?',
        back: 'A lightweight unit of execution.',
        sourceExcerpt: 'Threads are lightweight execution units.',
      },
    ],
    quiz: [
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
        question: 'What allocates the CPU?',
        options: [
          { id: 'A', text: 'File System' },
          { id: 'B', text: 'CPU Scheduler' },
          { id: 'C', text: 'DMA Controller' },
          { id: 'D', text: 'Page Swapper' },
        ],
        correctOptionId: 'B',
        explanation: 'The CPU scheduler allocates processor cycles.',
        sourceExcerpt: 'The CPU scheduler allocates the CPU.',
      },
    ],
    createdAt: new Date().toISOString(),
  };

  describe('1. Session Persistence Validation Contract', () => {
    it('validates a correct saved study session', () => {
      const serialized = JSON.stringify({
        studySet: sampleStudySet,
        notes: 'A process is a program in execution...',
        mode: 'both',
        difficulty: 'medium',
        savedAt: new Date().toISOString(),
      });

      const parsed = JSON.parse(serialized);
      const validation = StudySetSchema.safeParse(parsed.studySet);
      expect(validation.success).toBe(true);
    });

    it('rejects and flags corrupted session data in storage', () => {
      const corruptedData = {
        studySet: {
          id: 'corrupted',
          title: 'Broken',
          // missing flashcards and quiz arrays!
        },
        notes: 'Short note',
      };

      const validation = StudySetSchema.safeParse(corruptedData.studySet);
      expect(validation.success).toBe(false);
    });
  });

  describe('2. Client-Side Retest Isolation (0 API Calls)', () => {
    it('isolates only incorrect questions while preserving original study set', () => {
      // User got Q1 right ('A'), Q2 wrong ('C')
      const userAnswers = {
        'q-1': 'A',
        'q-2': 'C',
      };

      const originalQuestions = sampleStudySet.quiz;

      const incorrectOnly = originalQuestions.filter(
        (q) => userAnswers[q.id]?.toUpperCase() !== q.correctOptionId.toUpperCase()
      );

      // Verify incorrect questions isolated
      expect(incorrectOnly.length).toBe(1);
      expect(incorrectOnly[0].id).toBe('q-2');

      // Verify original study material is completely unchanged
      expect(originalQuestions.length).toBe(2);
      expect(originalQuestions[0].id).toBe('q-1');
      expect(originalQuestions[1].id).toBe('q-2');
    });

    it('calculates independent retest score upon retrying mistakes', () => {
      const retestQuestions = [sampleStudySet.quiz[1]]; // Only Q2

      // In retest, user selects the right answer ('B')
      const retestAnswers = { 'q-2': 'B' };

      const retestCorrect = retestQuestions.filter(
        (q) => retestAnswers[q.id]?.toUpperCase() === q.correctOptionId.toUpperCase()
      ).length;

      const newScorePercentage = Math.round((retestCorrect / retestQuestions.length) * 100);

      expect(retestCorrect).toBe(1);
      expect(newScorePercentage).toBe(100);
    });
  });
});

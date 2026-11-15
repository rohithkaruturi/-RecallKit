import { useState, useMemo, useCallback } from 'react';
import type { QuizQuestion } from '../../../shared/types';

export interface UseQuizReturn {
  currentQuestion: QuizQuestion | undefined;
  currentIndex: number;
  totalQuestions: number;
  selectedOptionId: string | null;
  isSubmitted: boolean;
  isCorrect: boolean;
  isComplete: boolean;
  score: number;
  scorePercentage: number;
  correctCount: number;
  incorrectCount: number;
  userAnswers: Record<string, string>;
  incorrectQuestions: QuizQuestion[];
  selectOption: (optionId: string) => void;
  submitAnswer: () => void;
  nextQuestion: () => void;
  resetQuiz: () => void;
}

export function useQuiz(questions: QuizQuestion[]): UseQuizReturn {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [submittedIds, setSubmittedIds] = useState<Set<string>>(new Set());
  const [isComplete, setIsComplete] = useState(false);

  const currentQuestion = questions[currentIndex];
  const isSubmitted = currentQuestion ? submittedIds.has(currentQuestion.id) : false;
  const selectedOptionId = currentQuestion ? userAnswers[currentQuestion.id] || null : null;

  const isCorrect = useMemo(() => {
    if (!currentQuestion || !isSubmitted || !selectedOptionId) return false;
    return selectedOptionId.toUpperCase() === currentQuestion.correctOptionId.toUpperCase();
  }, [currentQuestion, isSubmitted, selectedOptionId]);

  // Derived counts
  const { correctCount, incorrectCount, incorrectQuestions } = useMemo(() => {
    let correct = 0;
    let incorrect = 0;
    const wrongQuestions: QuizQuestion[] = [];

    questions.forEach((q) => {
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

    return {
      correctCount: correct,
      incorrectCount: incorrect,
      incorrectQuestions: wrongQuestions,
    };
  }, [questions, userAnswers]);

  const scorePercentage =
    questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

  const selectOption = useCallback(
    (optionId: string) => {
      if (!currentQuestion || isSubmitted) return;
      setUserAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionId }));
    },
    [currentQuestion, isSubmitted]
  );

  const submitAnswer = useCallback(() => {
    if (!currentQuestion || !selectedOptionId || isSubmitted) return;
    setSubmittedIds((prev) => new Set(prev).add(currentQuestion.id));
  }, [currentQuestion, selectedOptionId, isSubmitted]);

  const nextQuestion = useCallback(() => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsComplete(true);
    }
  }, [currentIndex, questions.length]);

  const resetQuiz = useCallback(() => {
    setCurrentIndex(0);
    setUserAnswers({});
    setSubmittedIds(new Set());
    setIsComplete(false);
  }, []);

  return {
    currentQuestion,
    currentIndex,
    totalQuestions: questions.length,
    selectedOptionId,
    isSubmitted,
    isCorrect,
    isComplete,
    score: correctCount,
    scorePercentage,
    correctCount,
    incorrectCount,
    userAnswers,
    incorrectQuestions,
    selectOption,
    submitAnswer,
    nextQuestion,
    resetQuiz,
  };
}

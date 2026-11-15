import React, { useState } from 'react';
import type { QuizQuestion } from '../../../../shared/types';
import { useQuiz } from '../../hooks/useQuiz';
import { QuizQuestionCard } from './QuizQuestionCard';
import { QuizResults } from './QuizResults';
import { EmptyState } from '../common/EmptyState';

export interface QuizEngineProps {
  questions: QuizQuestion[];
  onCompleteQuiz?: (results: {
    total: number;
    correct: number;
    incorrect: number;
    percentage: number;
    incorrectQuestions: QuizQuestion[];
  }) => void;
  onBackToOverview?: () => void;
}

export const QuizEngine: React.FC<QuizEngineProps> = ({
  questions,
  onCompleteQuiz,
  onBackToOverview,
}) => {
  // Support local retest filtering
  const [activeQuestionSet, setActiveQuestionSet] = useState<QuizQuestion[]>(questions);
  const [isRetestMode, setIsRetestMode] = useState(false);

  const {
    currentQuestion,
    currentIndex,
    totalQuestions,
    selectedOptionId,
    isSubmitted,
    isComplete,
    score,
    scorePercentage,
    correctCount,
    incorrectCount,
    userAnswers,
    selectOption,
    submitAnswer,
    nextQuestion,
    resetQuiz,
  } = useQuiz(activeQuestionSet);

  if (questions.length === 0) {
    return (
      <EmptyState
        title="No Quiz Questions Available"
        description="This study set was generated without a quiz. You can practice with flashcards or generate a new combined set."
      />
    );
  }

  // Handle retesting only incorrect answers (client-side, 0 API calls)
  const handleRetestIncorrect = (incorrectQuestions: QuizQuestion[]) => {
    setActiveQuestionSet(incorrectQuestions);
    setIsRetestMode(true);
    resetQuiz();
  };

  // Handle restarting the complete quiz
  const handleRetakeFullQuiz = () => {
    setActiveQuestionSet(questions);
    setIsRetestMode(false);
    resetQuiz();
  };

  // Completed State: Render QuizResults
  if (isComplete) {
    if (onCompleteQuiz) {
      onCompleteQuiz({
        total: totalQuestions,
        correct: correctCount,
        incorrect: incorrectCount,
        percentage: scorePercentage,
        incorrectQuestions: activeQuestionSet.filter(
          (q) => userAnswers[q.id]?.toUpperCase() !== q.correctOptionId.toUpperCase()
        ),
      });
    }

    return (
      <QuizResults
        totalQuestions={totalQuestions}
        correctCount={correctCount}
        incorrectCount={incorrectCount}
        scorePercentage={scorePercentage}
        questions={activeQuestionSet}
        userAnswers={userAnswers}
        onRetestIncorrect={handleRetestIncorrect}
        onRetakeFullQuiz={handleRetakeFullQuiz}
        onBackToOverview={onBackToOverview}
      />
    );
  }

  const progressPercentage =
    totalQuestions > 0 ? Math.round(((currentIndex + 1) / totalQuestions) * 100) : 0;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Retest Banner if drilling mistakes */}
      {isRetestMode && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
          <span className="font-semibold">
            🎯 Retest Mode: Practicing {activeQuestionSet.length} previously missed question{activeQuestionSet.length === 1 ? '' : 's'}
          </span>
          <button
            type="button"
            onClick={handleRetakeFullQuiz}
            className="text-amber-800 underline font-medium hover:text-amber-950 cursor-pointer"
          >
            Exit to Full Quiz
          </button>
        </div>
      )}

      {/* Top Header Card: Counter, Progress, and Live Score */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs">
        <span className="text-sm font-bold text-gray-900">
          Question {currentIndex + 1}{' '}
          <span className="text-gray-400 font-normal">of {totalQuestions}</span>
        </span>

        {/* Live score */}
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200">
          <span>Score:</span>
          <span className="text-indigo-600 font-bold">{score}</span>
          <span className="text-gray-400">/</span>
          <span>{currentIndex + (isSubmitted ? 1 : 0)}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Current Question */}
      {currentQuestion && (
        <QuizQuestionCard
          question={currentQuestion}
          selectedOptionId={selectedOptionId}
          isSubmitted={isSubmitted}
          onSelectOption={selectOption}
          onSubmitAnswer={submitAnswer}
          onNextQuestion={nextQuestion}
          isLastQuestion={currentIndex + 1 === totalQuestions}
        />
      )}
    </div>
  );
};

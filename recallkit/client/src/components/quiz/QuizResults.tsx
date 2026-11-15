import React from 'react';
import {
  Award,
  RotateCcw,
  RefreshCw,
  CheckCircle,
  XCircle,
  ArrowRight,
} from 'lucide-react';
import type { QuizQuestion } from '../../../../shared/types';
import { Button } from '../common/Button';

export interface QuizResultsProps {
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  scorePercentage: number;
  questions: QuizQuestion[];
  userAnswers: Record<string, string>;
  onRetestIncorrect: (incorrectQuestions: QuizQuestion[]) => void;
  onRetakeFullQuiz: () => void;
  onBackToOverview?: () => void;
}

export const QuizResults: React.FC<QuizResultsProps> = ({
  totalQuestions,
  correctCount,
  incorrectCount,
  scorePercentage,
  questions,
  userAnswers,
  onRetestIncorrect,
  onRetakeFullQuiz,
  onBackToOverview,
}) => {
  const incorrectQuestions = questions.filter(
    (q) => userAnswers[q.id]?.toUpperCase() !== q.correctOptionId.toUpperCase()
  );

  // Performance summary tier
  const performanceTier =
    scorePercentage >= 90
      ? {
          title: 'Mastery Level! 🌟',
          summary: 'Outstanding recall! You have an exceptional grasp of this material.',
          color: 'emerald',
        }
      : scorePercentage >= 70
      ? {
          title: 'Great Job! 🎯',
          summary: 'Solid comprehension! Review your incorrect answers to reach 100%.',
          color: 'indigo',
        }
      : scorePercentage >= 50
      ? {
          title: 'Good Progress 📚',
          summary: 'You understand the fundamentals. Retesting will help solidify the tricky concepts.',
          color: 'amber',
        }
      : {
          title: 'Needs Reinforcement 💡',
          summary: 'Several concepts need review. Try reading the flashcards before taking the quiz again.',
          color: 'rose',
        };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-2xs max-w-2xl mx-auto space-y-8">
      {/* Top Badge & Score Card */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-3xl mx-auto flex items-center justify-center bg-indigo-50 text-indigo-600 shadow-2xs">
          <Award className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Quiz Completed
          </span>

          <h2 className="text-4xl font-extrabold text-gray-900 mt-3 tracking-tight">
            {scorePercentage}%
          </h2>

          <h3 className="text-base font-bold text-gray-800 mt-1">
            {performanceTier.title}
          </h3>

          <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed mt-1">
            {performanceTier.summary}
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 text-center">
          <span className="text-xs text-gray-400 font-medium block">Total Questions</span>
          <span className="text-2xl font-bold text-gray-900 mt-1 block">{totalQuestions}</span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-center">
          <span className="text-xs text-emerald-700 font-semibold flex items-center justify-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> Correct
          </span>
          <span className="text-2xl font-bold text-emerald-800 mt-1 block">{correctCount}</span>
        </div>

        <div className="p-4 rounded-2xl bg-red-50/70 border border-red-100 text-center">
          <span className="text-xs text-red-700 font-semibold flex items-center justify-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> Missed
          </span>
          <span className="text-2xl font-bold text-red-800 mt-1 block">{incorrectCount}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        {incorrectQuestions.length > 0 && (
          <Button
            size="lg"
            variant="primary"
            onClick={() => onRetestIncorrect(incorrectQuestions)}
            className="w-full text-base font-semibold shadow-md"
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Retest {incorrectQuestions.length} Incorrect Answer{incorrectQuestions.length === 1 ? '' : 's'}
          </Button>
        )}

        <div className="flex items-center gap-3">
          <Button
            size="md"
            variant="outline"
            onClick={onRetakeFullQuiz}
            className="flex-1"
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            Retake Full Quiz
          </Button>

          {onBackToOverview && (
            <Button
              size="md"
              variant="ghost"
              onClick={onBackToOverview}
              className="flex-1 text-gray-600"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Study Overview
            </Button>
          )}
        </div>
      </div>

      {/* Question by Question Review */}
      <div className="border-t border-gray-100 pt-6 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Question Breakdown
        </h4>

        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {questions.map((q, idx) => {
            const userAns = userAnswers[q.id];
            const isRight = userAns?.toUpperCase() === q.correctOptionId.toUpperCase();

            return (
              <div
                key={q.id}
                className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                  isRight
                    ? 'border-emerald-100 bg-emerald-50/40 text-emerald-950'
                    : 'border-red-100 bg-red-50/40 text-red-950'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-bold shrink-0">#{idx + 1}</span>
                  <span className="truncate text-gray-700">{q.question}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isRight ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Correct
                    </span>
                  ) : (
                    <span className="text-red-700 font-semibold flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Option {q.correctOptionId}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

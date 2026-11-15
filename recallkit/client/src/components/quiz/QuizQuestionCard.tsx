import React from 'react';
import { CheckCircle2, AlertCircle, Quote, ArrowRight, Check } from 'lucide-react';
import type { QuizQuestion } from '../../../../shared/types';
import { QuizOption } from './QuizOption';
import { Button } from '../common/Button';

export interface QuizQuestionCardProps {
  question: QuizQuestion;
  selectedOptionId: string | null;
  isSubmitted: boolean;
  onSelectOption: (id: string) => void;
  onSubmitAnswer: () => void;
  onNextQuestion: () => void;
  isLastQuestion: boolean;
}

export const QuizQuestionCard: React.FC<QuizQuestionCardProps> = ({
  question,
  selectedOptionId,
  isSubmitted,
  onSelectOption,
  onSubmitAnswer,
  onNextQuestion,
  isLastQuestion,
}) => {
  const isCorrect =
    isSubmitted &&
    selectedOptionId?.toUpperCase() === question.correctOptionId.toUpperCase();

  return (
    <div className="space-y-6">
      {/* Question Prompt */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-2xs space-y-6">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug">
          {question.question}
        </h3>

        {/* 4 Options Grid */}
        <div className="space-y-3">
          {question.options.map((opt) => {
            const isOptCorrect =
              opt.id.toUpperCase() === question.correctOptionId.toUpperCase();
            const isOptSelected =
              selectedOptionId?.toUpperCase() === opt.id.toUpperCase();

            return (
              <QuizOption
                key={opt.id}
                option={opt}
                isSelected={isOptSelected}
                isSubmitted={isSubmitted}
                isCorrect={isOptCorrect}
                onSelect={onSelectOption}
              />
            );
          })}
        </div>

        {/* Submit or Next Button */}
        <div className="pt-2 flex justify-end">
          {!isSubmitted ? (
            <Button
              size="md"
              variant="primary"
              disabled={!selectedOptionId}
              onClick={onSubmitAnswer}
              leftIcon={<Check className="w-4 h-4" />}
            >
              Submit Answer
            </Button>
          ) : (
            <Button
              size="md"
              variant="primary"
              onClick={onNextQuestion}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {isLastQuestion ? 'View Final Results' : 'Next Question'}
            </Button>
          )}
        </div>
      </div>

      {/* Post-Submission Feedback & Explanation Box */}
      {isSubmitted && (
        <div
          className={`rounded-3xl p-6 sm:p-7 border transition-all duration-300 ${
            isCorrect
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
              : 'bg-red-50/70 border-red-200 text-red-950'
          }`}
        >
          {/* Header */}
          <div className="flex items-center gap-2 mb-2 font-bold text-sm">
            {isCorrect ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="text-emerald-900">Correct! Well done.</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-900">
                  Incorrect. The correct answer was Option {question.correctOptionId.toUpperCase()}.
                </span>
              </>
            )}
          </div>

          {/* Explanation Text */}
          <p className="text-sm leading-relaxed text-gray-800 mt-2">
            {question.explanation}
          </p>

          {/* Source Excerpt Quote */}
          {question.sourceExcerpt && (
            <div className="mt-4 pt-3 border-t border-gray-200/60 flex items-start gap-2 text-xs text-gray-600 bg-white/70 p-3 rounded-xl">
              <Quote className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
              <span className="italic leading-relaxed">
                Source: "{question.sourceExcerpt}"
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

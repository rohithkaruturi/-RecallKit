import React, { useState } from 'react';
import { Layers, HelpCircle, ArrowLeft, Calendar } from 'lucide-react';
import type { StudySet, QuizQuestion } from '../../../shared/types';
import { Card } from '../components/common/Card';
import { FlashcardViewer } from '../components/flashcards/FlashcardViewer';
import { QuizEngine } from '../components/quiz/QuizEngine';

export interface StudyPageProps {
  studySet: StudySet;
  onBackToEditor: () => void;
  onCompleteQuiz?: (results: {
    total: number;
    correct: number;
    incorrect: number;
    percentage: number;
    incorrectQuestions: QuizQuestion[];
  }) => void;
}

export const StudyPage: React.FC<StudyPageProps> = ({
  studySet,
  onBackToEditor,
  onCompleteQuiz,
}) => {
  // Default to the tab that has content
  const initialTab =
    studySet.flashcards.length > 0
      ? 'flashcards'
      : studySet.quiz.length > 0
      ? 'quiz'
      : 'flashcards';

  const [activeTab, setActiveTab] = useState<'flashcards' | 'quiz'>(initialTab);

  const formattedDate = new Date(studySet.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <Card padding="lg" className="study-header-shell rounded-[30px]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <button
            type="button"
            onClick={onBackToEditor}
            className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.08em] uppercase text-[#4c3edb] hover:text-[#3528aa] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Notes</span>
          </button>

          <div className="flex items-center gap-2 text-xs text-[#65708d] bg-white/70 border border-[rgba(132,123,176,0.12)] px-3 py-1.5 rounded-full">
            <Calendar className="w-3.5 h-3.5" />
            <span>Generated {formattedDate}</span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-[-0.05em] text-[#171b2d] mb-2">
          {studySet.title}
        </h1>

        <p className="text-sm sm:text-base text-[#59637d] leading-relaxed max-w-3xl">
          {studySet.summary}
        </p>

        <div className="flex flex-wrap items-center gap-2 mt-6 pt-6 border-t border-[rgba(132,123,176,0.12)]">
          {studySet.flashcards.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('flashcards')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-semibold text-sm transition-all cursor-pointer ${
                activeTab === 'flashcards'
                  ? 'bg-gradient-to-r from-[#4b39d6] to-[#7b65ff] text-white shadow-[0_18px_35px_rgba(91,74,227,0.25)]'
                  : 'bg-white/75 text-[#4d5877] border border-[rgba(132,123,176,0.12)] hover:bg-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Flashcards</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full ${
                  activeTab === 'flashcards'
                    ? 'bg-white/20 text-white'
                    : 'bg-[#ece7ff] text-[#4130b8]'
                }`}
              >
                {studySet.flashcards.length}
              </span>
            </button>
          )}

          {studySet.quiz.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-semibold text-sm transition-all cursor-pointer ${
                activeTab === 'quiz'
                  ? 'bg-gradient-to-r from-[#4b39d6] to-[#7b65ff] text-white shadow-[0_18px_35px_rgba(91,74,227,0.25)]'
                  : 'bg-white/75 text-[#4d5877] border border-[rgba(132,123,176,0.12)] hover:bg-white'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Practice Quiz</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full ${
                  activeTab === 'quiz'
                    ? 'bg-white/20 text-white'
                    : 'bg-[#ece7ff] text-[#4130b8]'
                }`}
              >
                {studySet.quiz.length}
              </span>
            </button>
          )}
        </div>
      </Card>

      <div>
        {activeTab === 'flashcards' && (
          <FlashcardViewer flashcards={studySet.flashcards} />
        )}

        {activeTab === 'quiz' && (
          <QuizEngine
            questions={studySet.quiz}
            onCompleteQuiz={onCompleteQuiz}
          />
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Sparkles, Brain, CheckCircle, ShieldCheck, History, ArrowRight, Trash2 } from 'lucide-react';
import type { GenerationMode, Difficulty, GenerateRequest } from '../../../shared/types';
import type { SavedSession } from '../hooks/useSessionStorage';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ErrorDisplay } from '../components/common/ErrorDisplay';
import { NoteEditor } from '../components/input/NoteEditor';
import { ModeSelector } from '../components/input/ModeSelector';
import { DifficultySelector } from '../components/input/DifficultySelector';

export interface HomePageProps {
  onGenerate: (request: GenerateRequest) => void;
  isLoading?: boolean;
  error?: string | null;
  onClearError?: () => void;
  savedSession?: SavedSession | null;
  onResumeSession?: (session: SavedSession) => void;
  onClearSavedSession?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onGenerate,
  isLoading = false,
  error = null,
  onClearError,
  savedSession,
  onResumeSession,
  onClearSavedSession,
}) => {
  const [notes, setNotes] = useState(savedSession?.notes || '');
  const [mode, setMode] = useState<GenerationMode>(savedSession?.mode || 'both');
  const [difficulty, setDifficulty] = useState<Difficulty>(savedSession?.difficulty || 'medium');

  const canSubmit = notes.trim().length >= 50 && !isLoading;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!canSubmit) return;

    onGenerate({
      notes: notes.trim(),
      mode,
      difficulty,
    });
  };

  const handleRetry = () => {
    if (canSubmit) {
      onGenerate({
        notes: notes.trim(),
        mode,
        difficulty,
      });
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto relative z-10">
      <div className="hero-panel rounded-[32px] px-6 py-8 sm:px-8 sm:py-10 text-white">
        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 bg-white/12 border border-white/15 text-white text-[11px] font-bold tracking-[0.12em] uppercase px-4 py-2 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-[#f5d98a]" />
            <span>Transform Notes Into Structured Study Material</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-[-0.06em] leading-[0.95]">
            Learn harder.
            <span className="block text-white/80">Remember longer.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-white/80 leading-relaxed">
            Paste your notes, lectures, or articles. Groq turns them into elegant flashcards and exam-style quizzes built for deep retention.
          </p>
        </div>
      </div>

      {savedSession && onResumeSession && (
        <div className="panel-surface rounded-[28px] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4d3ad2] to-[#7c68ff] text-white flex items-center justify-center shrink-0 shadow-[0_12px_28px_rgba(89,72,214,0.28)]">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-bold text-[#1b2138]">Saved Session Available</h4>
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] bg-[#efeaff] text-[#4e3adf] px-2 py-1 rounded-full">
                  Saved
                </span>
              </div>
              <p className="text-xs text-[#5b647d] mt-1 line-clamp-1">
                "{savedSession.studySet.title}" • {savedSession.studySet.flashcards.length} cards, {savedSession.studySet.quiz.length} questions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {onClearSavedSession && (
              <button
                type="button"
                onClick={onClearSavedSession}
                className="p-2.5 text-[#65718b] hover:text-[#ef4444] rounded-xl hover:bg-white transition-colors cursor-pointer"
                title="Discard saved session"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <Button
              size="sm"
              variant="primary"
              onClick={() => onResumeSession(savedSession)}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Resume Session
            </Button>
          </div>
        </div>
      )}

      {error && (
        <ErrorDisplay
          message={error}
          onRetry={handleRetry}
          onDismiss={onClearError}
        />
      )}

      <Card padding="lg" className="rounded-[30px] border-white/40">
        <form onSubmit={handleSubmit} className="space-y-6">
          <NoteEditor
            value={notes}
            onChange={setNotes}
            disabled={isLoading}
          />

          <div className="border-t border-[rgba(132,123,176,0.12)] pt-6 space-y-6">
            <ModeSelector
              value={mode}
              onChange={setMode}
              disabled={isLoading}
            />

            <DifficultySelector
              value={difficulty}
              onChange={setDifficulty}
              disabled={isLoading}
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              size="lg"
              variant="primary"
              isLoading={isLoading}
              disabled={!canSubmit}
              className="w-full text-base shadow-[0_22px_45px_rgba(90,78,214,0.28)]"
              leftIcon={<Brain className="w-5 h-5" />}
            >
              {isLoading ? 'Generating Study Material...' : 'Generate Flashcards & Quiz'}
            </Button>
          </div>
        </form>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="feature-card rounded-[24px] p-4 sm:p-5">
          <div className="icon-badge w-10 h-10 rounded-2xl flex items-center justify-center mb-4">
            <CheckCircle className="w-5 h-5 text-[#4d3ad2]" />
          </div>
          <h4 className="text-sm font-bold text-[#171b2d]">100% Grounded</h4>
          <p className="text-xs text-[#59637d] mt-2 leading-relaxed">Every card and question cites direct excerpts from your source notes.</p>
        </div>

        <div className="feature-card rounded-[24px] p-4 sm:p-5">
          <div className="icon-badge w-10 h-10 rounded-2xl flex items-center justify-center mb-4">
            <ShieldCheck className="w-5 h-5 text-[#4d3ad2]" />
          </div>
          <h4 className="text-sm font-bold text-[#171b2d]">Zod Validated</h4>
          <p className="text-xs text-[#59637d] mt-2 leading-relaxed">Runtime contracts ensure 4 unique MCQ options and verified answers.</p>
        </div>

        <div className="feature-card rounded-[24px] p-4 sm:p-5">
          <div className="icon-badge w-10 h-10 rounded-2xl flex items-center justify-center mb-4">
            <Brain className="w-5 h-5 text-[#4d3ad2]" />
          </div>
          <h4 className="text-sm font-bold text-[#171b2d]">Retest Engine</h4>
          <p className="text-xs text-[#59637d] mt-2 leading-relaxed">Review mistakes and drill incorrect answers without repeating API calls.</p>
        </div>
      </div>
    </div>
  );
};

import { useState, useCallback, useEffect } from 'react';
import type { StudySet, GenerationMode, Difficulty } from '../../../shared/types';
import { StudySetSchema } from '../../../shared/studySchema';

export interface SavedSession {
  studySet: StudySet;
  notes: string;
  mode: GenerationMode;
  difficulty: Difficulty;
  savedAt: string;
}

const STORAGE_KEY = 'recallkit_study_session';

export function useSessionStorage() {
  const [savedSession, setSavedSession] = useState<SavedSession | null>(null);

  // Load from LocalStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);

      // Validate saved studySet with Zod schema
      const validation = StudySetSchema.safeParse(parsed.studySet);
      if (validation.success && typeof parsed.notes === 'string') {
        setSavedSession({
          studySet: validation.data as StudySet,
          notes: parsed.notes,
          mode: parsed.mode || 'both',
          difficulty: parsed.difficulty || 'medium',
          savedAt: parsed.savedAt || new Date().toISOString(),
        });
      } else {
        // Discard corrupted or outdated schema data
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // LocalStorage access or parse failed safely
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const saveSession = useCallback(
    (
      studySet: StudySet,
      notes: string = '',
      mode: GenerationMode = 'both',
      difficulty: Difficulty = 'medium'
    ) => {
      try {
        const session: SavedSession = {
          studySet,
          notes,
          mode,
          difficulty,
          savedAt: new Date().toISOString(),
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
        setSavedSession(session);
      } catch (err) {
        console.warn('Could not save study session to LocalStorage:', err);
      }
    },
    []
  );

  const clearSession = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setSavedSession(null);
    } catch (err) {
      console.warn('Could not clear study session from LocalStorage:', err);
    }
  }, []);

  return {
    savedSession,
    hasSavedSession: Boolean(savedSession),
    saveSession,
    clearSession,
  };
}

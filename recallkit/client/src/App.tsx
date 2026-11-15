import React from 'react';
import type { GenerateRequest } from '../../shared/types';
import { useStudyGenerator } from './hooks/useStudyGenerator';
import { useSessionStorage, type SavedSession } from './hooks/useSessionStorage';
import { Layout } from './components/layout/Layout';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { HomePage } from './pages/HomePage';
import { StudyPage } from './pages/StudyPage';

export function App() {
  const {
    studySet,
    isLoading,
    error,
    generate,
    setStudySet,
    reset,
  } = useStudyGenerator();

  const {
    savedSession,
    saveSession,
    clearSession,
  } = useSessionStorage();

  const handleGenerate = async (request: GenerateRequest) => {
    await generate(request);
  };

  // When a study set is generated, automatically persist to LocalStorage
  React.useEffect(() => {
    if (studySet) {
      saveSession(studySet);
    }
  }, [studySet, saveSession]);

  const handleResumeSession = (session: SavedSession) => {
    setStudySet(session.studySet);
  };

  const handleNewSession = () => {
    reset();
  };

  return (
    <Layout
      hasActiveSession={Boolean(studySet)}
      onNewSession={handleNewSession}
      onBackToHome={handleNewSession}
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : studySet ? (
        <StudyPage
          studySet={studySet}
          onBackToEditor={handleNewSession}
        />
      ) : (
        <HomePage
          onGenerate={handleGenerate}
          isLoading={isLoading}
          error={error ? error.message : null}
          onClearError={reset}
          savedSession={savedSession}
          onResumeSession={handleResumeSession}
          onClearSavedSession={clearSession}
        />
      )}
    </Layout>
  );
}

export default App;

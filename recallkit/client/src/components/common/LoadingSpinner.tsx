import React, { useState, useEffect } from 'react';
import { Sparkles, Brain } from 'lucide-react';

export interface LoadingSpinnerProps {
  message?: string;
}

const STEPS = [
  'Reading and analyzing your study notes...',
  'Extracting core concepts and definitions...',
  'Generating interactive flashcards & quiz questions...',
  'Validating schema and source excerpts...',
  'Finalizing study session...',
];

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-[#4d3ad2] via-[#6f5af7] to-[#8d6ef8] border border-white/40 flex items-center justify-center shadow-[0_24px_60px_rgba(89,74,214,0.3)] animate-pulse">
          <Brain className="w-9 h-9 text-white animate-bounce" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#f59e0b] flex items-center justify-center border-2 border-white shadow-sm">
          <Sparkles className="w-3 h-3 text-white" />
        </div>
      </div>

      <h3 className="text-2xl font-extrabold tracking-[-0.05em] text-[#171b2d] mb-2">
        {message || 'Generating Study Material with Groq AI'}
      </h3>

      <p className="text-sm font-semibold text-[#4f46b4] min-h-6 transition-all duration-300">
        {STEPS[stepIndex]}
      </p>

      <div className="flex items-center gap-2 mt-6">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === stepIndex
                ? 'w-7 bg-[#5b4ae3]'
                : i < stepIndex
                ? 'w-2 bg-[#a9a0ff]'
                : 'w-2 bg-[#e2e6f5]'
            }`}
          />
        ))}
      </div>

      <div className="w-full max-w-md mt-10 space-y-3">
        <div className="h-20 bg-[linear-gradient(90deg,#f3f4f8,#ebf0fb,#f3f4f8)] bg-[length:200%_100%] rounded-[22px] animate-pulse" />
        <div className="h-16 bg-[linear-gradient(90deg,#f3f4f8,#eef2ff,#f3f4f8)] bg-[length:200%_100%] rounded-[18px] animate-pulse" />
      </div>
    </div>
  );
};

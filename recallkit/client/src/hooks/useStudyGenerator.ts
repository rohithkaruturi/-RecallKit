import { useReducer, useRef, useCallback } from 'react';
import type { StudySet, GenerateRequest } from '../../../shared/types';
import { generateStudySet } from '../services/api';

export interface GenerationState {
  status: 'idle' | 'loading' | 'success' | 'error';
  studySet: StudySet | null;
  error: { code: string; message: string; retryable: boolean } | null;
}

type GenerationAction =
  | { type: 'GENERATE_START' }
  | { type: 'GENERATE_SUCCESS'; payload: StudySet }
  | {
      type: 'GENERATE_ERROR';
      payload: { code: string; message: string; retryable: boolean };
    }
  | { type: 'SET_STUDY_SET'; payload: StudySet }
  | { type: 'RESET' };

const initialState: GenerationState = {
  status: 'idle',
  studySet: null,
  error: null,
};

function generationReducer(state: GenerationState, action: GenerationAction): GenerationState {
  switch (action.type) {
    case 'GENERATE_START':
      return {
        ...state,
        status: 'loading',
        error: null,
      };
    case 'GENERATE_SUCCESS':
      return {
        status: 'success',
        studySet: action.payload,
        error: null,
      };
    case 'GENERATE_ERROR':
      return {
        ...state,
        status: 'error',
        error: action.payload,
      };
    case 'SET_STUDY_SET':
      return {
        status: 'success',
        studySet: action.payload,
        error: null,
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export function useStudyGenerator() {
  const [state, dispatch] = useReducer(generationReducer, initialState);

  // Stale-request & race condition guards using useRef
  const activeRequestIdRef = useRef<string>('');
  const abortControllerRef = useRef<AbortController | null>(null);

  const generate = useCallback(async (request: GenerateRequest) => {
    // 1. Cancel previous in-flight request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Generate unique ID for this invocation
    const currentRequestId = crypto.randomUUID();
    activeRequestIdRef.current = currentRequestId;

    dispatch({ type: 'GENERATE_START' });

    try {
      const result = await generateStudySet(request, controller.signal);

      // Stale response guard: Ignore if another request was triggered in the meantime
      if (activeRequestIdRef.current !== currentRequestId) {
        return;
      }

      if (result.ok) {
        dispatch({ type: 'GENERATE_SUCCESS', payload: result.data });
      } else {
        dispatch({
          type: 'GENERATE_ERROR',
          payload: {
            code: result.error.code,
            message: result.error.message,
            retryable: result.error.retryable,
          },
        });
      }
    } catch (err: unknown) {
      // Ignore AbortError caused by intentional user cancellation
      if ((err as Error)?.name === 'AbortError') {
        return;
      }

      if (activeRequestIdRef.current !== currentRequestId) {
        return;
      }

      const message = err instanceof Error ? err.message : 'Unknown generation failure';
      dispatch({
        type: 'GENERATE_ERROR',
        payload: {
          code: 'NETWORK_ERROR',
          message,
          retryable: true,
        },
      });
    } finally {
      if (activeRequestIdRef.current === currentRequestId) {
        abortControllerRef.current = null;
      }
    }
  }, []);

  const setStudySet = useCallback((studySet: StudySet) => {
    dispatch({ type: 'SET_STUDY_SET', payload: studySet });
  }, []);

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    activeRequestIdRef.current = '';
    dispatch({ type: 'RESET' });
  }, []);

  return {
    ...state,
    isLoading: state.status === 'loading',
    generate,
    setStudySet,
    reset,
  };
}

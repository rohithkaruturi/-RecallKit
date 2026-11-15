import type { StudySet, GenerateRequest, ApiResult } from '../../../shared/types';

const API_BASE = '/api';

/**
 * Sends study notes to the backend for AI generation, schema validation, and enrichment.
 */
export async function generateStudySet(
  request: GenerateRequest,
  signal?: AbortSignal
): Promise<ApiResult<StudySet>> {
  try {
    const res = await fetch(`${API_BASE}/study/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal,
    });

    const data = await res.json();
    return data as ApiResult<StudySet>;
  } catch (err: unknown) {
    if ((err as Error)?.name === 'AbortError') {
      throw err;
    }

    const message = err instanceof Error ? err.message : 'Network request failed';
    return {
      ok: false,
      error: {
        code: 'NETWORK_ERROR',
        message: `Failed to connect to the RecallKit server: ${message}`,
        retryable: true,
      },
    };
  }
}

/**
 * Health check to verify backend connectivity.
 */
export async function checkServerHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
}

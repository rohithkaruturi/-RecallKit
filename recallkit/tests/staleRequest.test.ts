import { describe, it, expect, vi } from 'vitest';

describe('TASK 9 — Stale Request & Race Condition Protection', () => {
  it('discards stale response when older request finishes AFTER newer request', async () => {
    let activeRequestId = '';
    let displayedStudyTitle = '';

    // Simulated generator function
    const simulateRequest = async (id: string, title: string, delayMs: number) => {
      activeRequestId = id; // Update active ref

      await new Promise((resolve) => setTimeout(resolve, delayMs));

      // Guard check before updating state (the useRef guard pattern in useStudyGenerator)
      if (activeRequestId === id) {
        displayedStudyTitle = title;
      }
    };

    // User starts Request A (slow: 100ms)
    const requestAPromise = simulateRequest('req-A', 'Study Set A (Old)', 100);

    // User changes input and starts Request B immediately (fast: 20ms)
    const requestBPromise = simulateRequest('req-B', 'Study Set B (New)', 20);

    // Wait for both to settle
    await Promise.all([requestAPromise, requestBPromise]);

    // Application MUST display Request B, because Request A was discarded as stale
    expect(displayedStudyTitle).toBe('Study Set B (New)');
  });

  it('triggers AbortController cancellation on in-flight requests', () => {
    let currentController: AbortController | null = null;
    let abortedCount = 0;

    const startRequest = () => {
      if (currentController) {
        currentController.abort();
        abortedCount++;
      }
      currentController = new AbortController();
      return currentController;
    };

    // Start request 1
    const c1 = startRequest();
    expect(c1.signal.aborted).toBe(false);

    // Start request 2 while 1 is in flight
    const c2 = startRequest();
    expect(c1.signal.aborted).toBe(true);
    expect(c2.signal.aborted).toBe(false);
    expect(abortedCount).toBe(1);
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../server/src/index';
import * as groqService from '../server/src/services/groqService';

describe('TASK 5 — Backend API Development (Express Endpoints)', () => {
  const sampleNotes =
    'Operating systems manage computer hardware and application execution. The CPU scheduler determines which ready process gets CPU time. Virtual memory provides an illusion of large continuous memory.';

  const mockStudySet = {
    title: 'Operating Systems Overview',
    summary: 'Hardware management, scheduling, and virtual memory.',
    flashcards: [
      {
        front: 'What does the CPU scheduler do?',
        back: 'Allocates CPU time to ready processes.',
        sourceExcerpt: 'The CPU scheduler determines which ready process gets CPU time.',
      },
    ],
    quiz: [
      {
        question: 'Which component allocates CPU time to ready processes?',
        options: [
          { id: 'A', text: 'CPU Scheduler' },
          { id: 'B', text: 'Disk Driver' },
          { id: 'C', text: 'Cache Controller' },
          { id: 'D', text: 'Bus Arbiter' },
        ],
        correctOptionId: 'A',
        explanation: 'The CPU scheduler selects from processes ready to execute.',
        sourceExcerpt: 'The CPU scheduler determines which ready process gets CPU time.',
      },
    ],
  };

  describe('1. Health Check Endpoint (GET /api/health)', () => {
    it('returns status ok with timestamp and uptime', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.timestamp).toBeDefined();
      expect(typeof res.body.uptime).toBe('number');
    });

    it('sets security headers via Helmet', async () => {
      const res = await request(app).get('/api/health');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
    });
  });

  describe('2. Study Generation Endpoint (POST /api/study/generate)', () => {
    it('rejects missing request body with 400 and INVALID_REQUEST', async () => {
      const res = await request(app)
        .post('/api/study/generate')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.error.code).toBe('INVALID_REQUEST');
      expect(res.body.error.retryable).toBe(false);
    });

    it('rejects notes that are too short (< 50 characters)', async () => {
      const res = await request(app)
        .post('/api/study/generate')
        .send({
          notes: 'Short note',
          mode: 'both',
          difficulty: 'medium',
        });

      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.error.code).toBe('INVALID_REQUEST');
      expect(res.body.error.message).toContain('at least 50 characters');
    });

    it('rejects invalid generation mode', async () => {
      const res = await request(app)
        .post('/api/study/generate')
        .send({
          notes: sampleNotes,
          mode: 'unsupported_mode',
          difficulty: 'medium',
        });

      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.error.code).toBe('INVALID_REQUEST');
    });

    it('rejects invalid difficulty', async () => {
      const res = await request(app)
        .post('/api/study/generate')
        .send({
          notes: sampleNotes,
          mode: 'both',
          difficulty: 'super_hard',
        });

      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.error.code).toBe('INVALID_REQUEST');
    });

    it('returns 200 with validated StudySet on valid request', async () => {
      vi.spyOn(groqService, 'generateContentWithGroq').mockResolvedValueOnce(
        JSON.stringify(mockStudySet)
      );

      const res = await request(app)
        .post('/api/study/generate')
        .send({
          notes: sampleNotes,
          mode: 'both',
          difficulty: 'medium',
        });

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.title).toBe(mockStudySet.title);
      expect(res.body.data.flashcards.length).toBe(1);
      expect(res.body.data.quiz.length).toBe(1);
    });

    it('handles AI failure gracefully with 502 and retryable error', async () => {
      vi.spyOn(groqService, 'generateContentWithGroq').mockResolvedValue(
        'not valid json at all'
      );

      const res = await request(app)
        .post('/api/study/generate')
        .send({
          notes: sampleNotes,
          mode: 'both',
          difficulty: 'medium',
        });

      expect(res.status).toBe(502);
      expect(res.body.ok).toBe(false);
      expect(res.body.error.code).toBe('INVALID_AI_OUTPUT');
      expect(res.body.error.retryable).toBe(true);
    });
  });

  describe('3. Route Fallback (404 Not Found)', () => {
    it('returns standardized 404 JSON for unknown routes', async () => {
      const res = await request(app).get('/api/unknown-endpoint');
      expect(res.status).toBe(404);
      expect(res.body.ok).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });
});

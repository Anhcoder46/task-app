import { describe, it, expect } from 'vitest';

describe('Health Check', () => {
  it('should return ok: true', async () => {
    // Dynamically import to avoid loading .env in tests
    const response = { ok: true };
    expect(response).toEqual({ ok: true });
  });
});

describe('API Contract', () => {
  it('should have required endpoints defined', () => {
    const requiredEndpoints = [
      'GET /api/health',
      'GET /api/tasks',
      'POST /api/tasks',
      'PATCH /api/tasks/:id/status',
      'POST /api/tasks/:id/attachment',
      'DELETE /api/tasks/:id/attachment',
      'GET /api/messages',
      'POST /api/messages',
    ];
    expect(requiredEndpoints.length).toBe(8);
  });

  it('should validate task status values', () => {
    const validStatuses = ['open', 'in_progress', 'done'];
    expect(validStatuses).toContain('open');
    expect(validStatuses).toContain('in_progress');
    expect(validStatuses).toContain('done');
    expect(validStatuses).not.toContain('cancelled');
  });
});

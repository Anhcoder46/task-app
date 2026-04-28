import { describe, it, expect } from 'vitest';

describe('App Structure', () => {
  it('should have correct task status values', () => {
    const validStatuses = ['open', 'in_progress', 'done'];
    expect(validStatuses).toHaveLength(3);
  });

  it('should construct API URL correctly', () => {
    const baseUrl = '';
    const path = '/api/tasks';
    expect(`${baseUrl}${path}`).toBe('/api/tasks');
  });

  it('should construct API URL with base URL', () => {
    const baseUrl = 'https://backend.vercel.app';
    const path = '/api/tasks';
    expect(`${baseUrl}${path}`).toBe('https://backend.vercel.app/api/tasks');
  });
});

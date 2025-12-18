import { describe, it, expect } from 'vitest';
import {
  trackDescriptionUsage,
  getDescriptionDb,
} from '../../server/api/descriptions/descriptions-db';

describe('Descriptions DB', () => {
  it('should track description usage with category', () => {
    trackDescriptionUsage('Test Description', 'Test Category');

    const db = getDescriptionDb();
    const result = db
      .prepare('SELECT * FROM description_usage WHERE description = ?')
      .get('Test Description') as any;

    expect(result).toBeDefined();
    expect(result.description).toBe('Test Description');
    expect(result.last_category).toBe('Test Category');
    expect(result.usage_count).toBe(1);
  });

  it('should update category when description is used again', () => {
    trackDescriptionUsage('Reusable Description', 'Cat1');
    trackDescriptionUsage('Reusable Description', 'Cat2');

    const db = getDescriptionDb();
    const result = db
      .prepare('SELECT * FROM description_usage WHERE description = ?')
      .get('Reusable Description') as any;

    expect(result).toBeDefined();
    expect(result.description).toBe('Reusable Description');
    expect(result.last_category).toBe('Cat2');
    expect(result.usage_count).toBe(2);
  });
});

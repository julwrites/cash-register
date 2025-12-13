import { describe, it, expect } from 'vitest';
import {
  getDescriptionDb,
  trackDescriptionUsage,
} from '../../server/api/descriptions/descriptions-db';

describe('Descriptions DB', () => {
  it('should initialize description_usage table', () => {
    const db = getDescriptionDb();
    expect(db).toBeDefined();

    const tableInfo = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='description_usage'"
      )
      .get();
    expect(tableInfo).toBeDefined();
  });

  it('should track description usage', () => {
    trackDescriptionUsage('Test Desc');
    const db = getDescriptionDb();
    const row = db
      .prepare('SELECT * FROM description_usage WHERE description = ?')
      .get('Test Desc') as any;
    expect(row).toBeDefined();
    expect(row.usage_count).toBe(1);

    trackDescriptionUsage('Test Desc');
    const row2 = db
      .prepare('SELECT * FROM description_usage WHERE description = ?')
      .get('Test Desc') as any;
    expect(row2.usage_count).toBe(2);
  });
});

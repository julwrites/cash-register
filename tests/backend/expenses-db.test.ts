import { describe, it, expect } from 'vitest';
import { getDb } from '../../server/api/expenses/expenses-db';

describe('Expenses DB', () => {
  it('should initialize db for a year', () => {
    const db = getDb(2023);
    expect(db).toBeDefined();
    // Check table exists
    const table = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='expenses'"
      )
      .get();
    expect(table).toBeDefined();
  });

  it('should reuse connection for same year', () => {
    const db1 = getDb(2024);
    const db2 = getDb(2024);
    expect(db1).toBe(db2);
  });

  it('should create separate connections for different years', () => {
    const db1 = getDb(2025);
    const db2 = getDb(2026);
    expect(db1).not.toBe(db2);
  });
});

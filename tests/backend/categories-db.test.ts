import { describe, it, expect } from 'vitest';
import { getCategoryDb } from '../../server/api/categories/categories-db';

describe('Categories DB', () => {
  it('should initialize and create categories table', () => {
    const db = getCategoryDb();
    expect(db).toBeDefined();

    const tableInfo = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='categories'"
      )
      .get();
    expect(tableInfo).toBeDefined();
  });

  it('should insert and retrieve a category', () => {
    const db = getCategoryDb();

    const result = db
      .prepare('INSERT INTO categories (name) VALUES (?)')
      .run('Food');
    expect(result.lastInsertRowid).toBeDefined();

    const retrieved = db
      .prepare('SELECT * FROM categories WHERE id = ?')
      .get(result.lastInsertRowid) as any;
    expect(retrieved).toBeDefined();
    expect(retrieved.name).toBe('Food');
  });
});

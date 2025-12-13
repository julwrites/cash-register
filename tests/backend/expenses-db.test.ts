import { describe, it, expect } from 'vitest';
import { getDb } from '../../server/api/expenses/expenses-db';

describe('Expenses DB', () => {
  it('should initialize and create expenses table', () => {
    const year = 2024;
    const db = getDb(year);
    expect(db).toBeDefined();

    const tableInfo = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='expenses'"
      )
      .get();
    expect(tableInfo).toBeDefined();
  });

  it('should insert and retrieve an expense', () => {
    const year = 2024;
    const db = getDb(year);

    const expense = {
      description: 'Test Expense',
      credit: 100,
      debit: 0,
      date: '2024-01-01',
      category: 'Food',
    };

    const result = db
      .prepare(
        `
      INSERT INTO expenses (credit, debit, description, date, category)
      VALUES (?, ?, ?, ?, ?)
    `
      )
      .run(
        expense.credit,
        expense.debit,
        expense.description,
        expense.date,
        expense.category
      );

    expect(result.lastInsertRowid).toBeDefined();

    const retrieved = db
      .prepare('SELECT * FROM expenses WHERE id = ?')
      .get(result.lastInsertRowid) as any;
    expect(retrieved).toBeDefined();
    expect(retrieved.description).toBe('Test Expense');
    expect(retrieved.credit).toBe(100);
  });

  it('should cache database connections', () => {
    const year = 2024;
    const db1 = getDb(year);
    const db2 = getDb(year);
    expect(db1).toBe(db2);
  });

  it('should create separate databases for different years', () => {
    const db1 = getDb(2024);
    const db2 = getDb(2025);
    expect(db1).not.toBe(db2);
    // better-sqlite3 database object has a 'name' property which is the filename
    expect(db1.name).toContain('expenses-2024.sqlite');
    expect(db2.name).toContain('expenses-2025.sqlite');
  });
});

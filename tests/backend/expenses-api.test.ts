import { describe, it, expect } from 'vitest';
import { setup, $fetch } from '@nuxt/test-utils';

describe('Expenses API', async () => {
  await setup({});

  it('should fetch expenses', async () => {
    // Seed data using DB
    const { getDb } = await import('../../server/api/expenses/expenses-db');
    const db = getDb(2023);
    db.prepare('DELETE FROM expenses').run();
    db.prepare(
      'INSERT INTO expenses (description, date, category, credit, debit) VALUES (?, ?, ?, ?, ?)'
    ).run('Test Expense', '2023-01-01', 'Food', 100, 0);

    const expenses = await $fetch('/api/expenses');
    expect(expenses).toBeDefined();
    expect(Array.isArray(expenses)).toBe(true);
    const expense = (expenses as any[]).find(
      (e: any) => e.description === 'Test Expense'
    );
    expect(expense).toBeDefined();
    expect(expense.category).toBe('Food');
  });
});

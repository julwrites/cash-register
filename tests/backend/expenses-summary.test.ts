import { describe, it, expect } from 'vitest';
import { setup, $fetch } from '@nuxt/test-utils';

describe('Expenses Summary API', async () => {
  await setup({});

  it('should fetch expense summary', async () => {
    // Seed data
    const { getDb } = await import('../../server/api/expenses/expenses-db');
    const db = getDb(2023);
    db.prepare('DELETE FROM expenses').run();
    db.prepare(
        'INSERT INTO expenses (description, date, category, credit, debit) VALUES (?, ?, ?, ?, ?)'
    ).run('Income 1', '2023-01-01', 'Salary', 1000, 0);
    db.prepare(
        'INSERT INTO expenses (description, date, category, credit, debit) VALUES (?, ?, ?, ?, ?)'
    ).run('Expense 1', '2023-01-02', 'Food', 0, 50);
    db.prepare(
        'INSERT INTO expenses (description, date, category, credit, debit) VALUES (?, ?, ?, ?, ?)'
    ).run('Expense 2', '2023-01-03', 'Transport', 0, 30);
    db.prepare(
        'INSERT INTO expenses (description, date, category, credit, debit) VALUES (?, ?, ?, ?, ?)'
    ).run('Expense 3', '2023-01-04', 'Food', 0, 20);

    const summary: any = await $fetch('/api/expenses/summary?startDate=2023-01-01&endDate=2023-12-31');
    expect(summary).toBeDefined();
    expect(summary.income).toBe(1000);
    expect(summary.expenses).toBe(100); // 50 + 30 + 20
    expect(summary.byCategory).toBeDefined();
    expect(summary.byCategory['Food']).toBe(70); // 50 + 20
    expect(summary.byCategory['Transport']).toBe(30);
  });
});

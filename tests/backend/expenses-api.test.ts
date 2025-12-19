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

  it('should add an expense', async () => {
    const newExpense = {
      description: 'New Expense',
      date: '2023-01-02',
      category: 'Transport',
      credit: 0,
      debit: 50
    };

    const response: any = await $fetch('/api/expenses/add', {
      method: 'POST',
      body: newExpense
    });

    expect(response).toHaveProperty('id');
    expect(response).toHaveProperty('description', 'New Expense');
  });

  it('should fail if missing required fields', async () => {
    try {
      await $fetch('/api/expenses/add', {
        method: 'POST',
        body: { description: 'Incomplete' }
      });
      // Should fail
      expect(true).toBe(false);
    } catch (e: any) {
      expect(e.response.status).toBe(400);
      expect(e.response._data.statusMessage).toBe('Missing required fields');
    }
  });
});

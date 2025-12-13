import { describe, it, expect, beforeEach } from 'vitest';
import { setup, $fetch } from '@nuxt/test-utils';
import { getDb } from '../../server/api/expenses/expenses-db';

describe('Expenses Pagination API', async () => {
  await setup({});

  beforeEach(() => {
    // Setup test data across multiple years
    const years = [2023, 2024, 2025];
    for (const year of years) {
      const db = getDb(year);
      db.prepare('DELETE FROM expenses').run();

      // Insert 5 records per year
      // 2025-01-05, 2025-01-04...
      for (let i = 1; i <= 5; i++) {
        db.prepare(
          'INSERT INTO expenses (description, date, category, credit, debit) VALUES (?, ?, ?, ?, ?)'
        ).run(`Expense ${year}-${i}`, `${year}-01-0${i}`, 'Food', 100, 0);
      }
    }
  });

  it('should fetch all expenses by default (backward compatibility)', async () => {
    const expenses: any = await $fetch('/api/expenses');
    expect(Array.isArray(expenses)).toBe(true);
    // 3 years * 5 records = 15 records
    expect(expenses.length).toBe(15);
  });

  it('should fetch paginated expenses (page 1)', async () => {
    // Page 1, limit 5. Should get latest expenses (2025)
    // 2025-01-05 (ID 5), 2025-01-04 (ID 4), ... 2025-01-01 (ID 1)
    // Wait, DB insertion order might differ from Date order if we are not careful?
    // We inserted 1, 2, 3, 4, 5 with dates 01, 02, 03, 04, 05.
    // ORDER BY date DESC -> 05, 04, 03, 02, 01.

    const response: any = await $fetch('/api/expenses?page=1&limit=5');

    expect(response).toHaveProperty('data');
    expect(response).toHaveProperty('total');
    expect(response.total).toBe(15);
    expect(response.data.length).toBe(5);

    expect(response.data[0].date).toBe('2025-01-05');
    expect(response.data[4].date).toBe('2025-01-01');
  });

  it('should fetch paginated expenses (page 2 - crossing year boundary)', async () => {
    // Page 2, limit 5. Should get 2024 expenses.
    const response: any = await $fetch('/api/expenses?page=2&limit=5');

    expect(response.data.length).toBe(5);
    expect(response.data[0].date).toBe('2024-01-05');
  });

  it('should fetch paginated expenses with cross-year slice', async () => {
    // Page 1, limit 7. Should get 5 from 2025 and 2 from 2024.
    const response: any = await $fetch('/api/expenses?page=1&limit=7');

    expect(response.data.length).toBe(7);
    expect(response.data[0].date).toBe('2025-01-05'); // Newest
    expect(response.data[4].date).toBe('2025-01-01'); // Oldest 2025
    expect(response.data[5].date).toBe('2024-01-05'); // Newest 2024
    expect(response.data[6].date).toBe('2024-01-04');
  });

  it('should filter by category', async () => {
    // Insert a different category
    const db = getDb(2025);
    db.prepare(
      'INSERT INTO expenses (description, date, category, credit, debit) VALUES (?, ?, ?, ?, ?)'
    ).run(`Travel Expense`, `2025-02-01`, 'Travel', 200, 0);

    const response: any = await $fetch(
      '/api/expenses?page=1&limit=10&category=Travel'
    );
    expect(response.total).toBe(1);
    expect(response.data.length).toBe(1);
    expect(response.data[0].category).toBe('Travel');
  });
});

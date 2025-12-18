import { describe, it, expect, beforeEach } from 'vitest';
import { setup, $fetch } from '@nuxt/test-utils';
import { getDb } from '../../server/api/expenses/expenses-db';

describe('Expenses Sorting API', async () => {
  await setup({});

  beforeEach(() => {
    // Setup test data across multiple years
    const years = [2023, 2024, 2025];
    for (const year of years) {
      const db = getDb(year);
      db.prepare('DELETE FROM expenses').run();

      // Insert records with varying amounts and descriptions
      // 2025: Amount -10, Desc A
      // 2024: Amount -100, Desc C
      // 2023: Amount -50, Desc B
      if (year === 2025) {
         db.prepare('INSERT INTO expenses (description, date, category, credit, debit) VALUES (?, ?, ?, ?, ?)').run('Desc A', '2025-01-01', 'Food', 0, 10);
      } else if (year === 2024) {
         db.prepare('INSERT INTO expenses (description, date, category, credit, debit) VALUES (?, ?, ?, ?, ?)').run('Desc C', '2024-01-01', 'Travel', 0, 100);
      } else if (year === 2023) {
         db.prepare('INSERT INTO expenses (description, date, category, credit, debit) VALUES (?, ?, ?, ?, ?)').run('Desc B', '2023-01-01', 'Food', 0, 50);
      }
    }
  });

  it('should sort by amount DESC (highest value first)', async () => {
    // Logic: amount = credit - debit.
    // 2025: 0 - 10 = -10
    // 2024: 0 - 100 = -100
    // 2023: 0 - 50 = -50

    // Sort DESC (Higher first): -10 > -50 > -100
    // Order: 2025, 2023, 2024

    const response: any = await $fetch('/api/expenses?page=1&limit=10&sortBy=amount&sortOrder=desc');
    expect(response.data.length).toBe(3);
    expect(response.data[0].date).toBe('2025-01-01'); // -10
    expect(response.data[1].date).toBe('2023-01-01'); // -50
    expect(response.data[2].date).toBe('2024-01-01'); // -100
  });

  it('should sort by amount ASC (lowest value first)', async () => {
    // Sort ASC (Lower first): -100 < -50 < -10
    // Order: 2024, 2023, 2025

    const response: any = await $fetch('/api/expenses?page=1&limit=10&sortBy=amount&sortOrder=asc');
    expect(response.data.length).toBe(3);
    expect(response.data[0].date).toBe('2024-01-01');
    expect(response.data[1].date).toBe('2023-01-01');
    expect(response.data[2].date).toBe('2025-01-01');
  });

  it('should sort by description ASC', async () => {
    // Desc A, Desc B, Desc C
    const response: any = await $fetch('/api/expenses?page=1&limit=10&sortBy=description&sortOrder=asc');
    expect(response.data[0].description).toBe('Desc A');
    expect(response.data[1].description).toBe('Desc B');
    expect(response.data[2].description).toBe('Desc C');
  });

   it('should sort by description DESC', async () => {
    // Desc C, Desc B, Desc A
    const response: any = await $fetch('/api/expenses?page=1&limit=10&sortBy=description&sortOrder=desc');
    expect(response.data[0].description).toBe('Desc C');
    expect(response.data[1].description).toBe('Desc B');
    expect(response.data[2].description).toBe('Desc A');
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { processRecurringExpenses, addRecurring, getRecurringDb, type RecurringExpense } from '../../server/api/recurring/recurring-db';

// Mock dependencies
const { mockGetDb, mockPrepare, mockRun, mockGet } = vi.hoisted(() => {
  const mockRun = vi.fn();
  const mockGet = vi.fn();
  // Chainable mock: prepare returns object with run and get
  const mockPrepare = vi.fn(() => ({ run: mockRun, get: mockGet }));
  const mockGetDb = vi.fn(() => ({ prepare: mockPrepare }));
  return { mockGetDb, mockPrepare, mockRun, mockGet };
});

vi.mock('../../server/api/expenses/expenses-db', () => ({
  getDb: mockGetDb,
}));

vi.mock('../../server/api/descriptions/descriptions-db', () => ({
  trackDescriptionUsage: vi.fn(),
}));

describe('Recurring Expenses DB', () => {

  beforeEach(() => {
    vi.useFakeTimers();
    // Clear DB table
    const db = getRecurringDb();
    db.prepare('DELETE FROM recurring_expenses').run();
    mockRun.mockClear();
    mockPrepare.mockClear();
    mockGetDb.mockClear();
    mockGet.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should add and retrieve recurring expenses', () => {
      const expense: RecurringExpense = {
          amount: 100,
          description: 'Rent',
          category: 'Housing',
          frequency: 'monthly',
          next_due_date: '2025-01-01',
          active: true
      };

      const added = addRecurring(expense);
      expect(added.id).toBeDefined();
      expect(added.description).toBe('Rent');
  });

  it('should process due expenses', () => {
      // Set today to 2025-02-01
      vi.setSystemTime(new Date('2025-02-01'));

      const expense: RecurringExpense = {
          amount: 100,
          description: 'Rent',
          category: 'Housing',
          frequency: 'monthly',
          next_due_date: '2025-01-01', // Due 1 month ago
          active: true
      };

      addRecurring(expense);

      const count = processRecurringExpenses();
      expect(count).toBe(2);

      // Verify expense was added (mock called)
      expect(mockRun).toHaveBeenCalledTimes(2);
      expect(mockRun).toHaveBeenCalledWith(0, 100, 'Rent', '2025-01-01', 'Housing');
      expect(mockRun).toHaveBeenCalledWith(0, 100, 'Rent', '2025-02-01', 'Housing');

      // Check if next_due_date was updated
      const db = getRecurringDb();
      const row = db.prepare('SELECT * FROM recurring_expenses').get() as RecurringExpense;
      expect(row.next_due_date).toBe('2025-03-01');
  });

  it('should not process future expenses', () => {
      vi.setSystemTime(new Date('2024-12-31'));

      const expense: RecurringExpense = {
          amount: 100,
          description: 'Rent',
          category: 'Housing',
          frequency: 'monthly',
          next_due_date: '2025-01-01',
          active: true
      };

      addRecurring(expense);

      const count = processRecurringExpenses();
      expect(count).toBe(0);
      expect(mockRun).not.toHaveBeenCalled();
  });

  it('should process multiple missed occurrences', () => {
      // Set today to 2025-04-01
      vi.setSystemTime(new Date('2025-04-01'));

      const expense: RecurringExpense = {
          amount: 100,
          description: 'Rent',
          category: 'Housing',
          frequency: 'monthly',
          next_due_date: '2025-01-01',
          active: true
      };

      addRecurring(expense);

      const count = processRecurringExpenses();

      // Should process Jan 1, Feb 1, Mar 1, Apr 1 = 4 times
      expect(count).toBe(4);
      expect(mockRun).toHaveBeenCalledTimes(4);

      const db = getRecurringDb();
      const row = db.prepare('SELECT * FROM recurring_expenses').get() as RecurringExpense;
      expect(row.next_due_date).toBe('2025-05-01');
  });

  it('should skip duplicate expenses but advance due date', () => {
      // Set today to 2025-01-01
      vi.setSystemTime(new Date('2025-01-01'));

      const expense: RecurringExpense = {
          amount: 100,
          description: 'Netflix',
          category: 'Entertainment',
          frequency: 'monthly',
          next_due_date: '2025-01-01',
          active: true
      };

      addRecurring(expense);

      // Simulate finding a duplicate for the check-query
      mockGet.mockReturnValueOnce({ id: 999 });

      const count = processRecurringExpenses();

      // Should count as processed (0 insertions, but processedCount increments in current logic?
      // Actually, my code only increments processedCount if !existing.
      // So let's check expectations.
      // If deduplicated, processedCount should be 0 (inserted), but modification logic runs.
      // Wait, let's check code:
      // if (!existing) { processedCount++ } else { ... }
      // modifications++ always.

      expect(count).toBe(0);

      // Insert should NOT be called
      expect(mockRun).not.toHaveBeenCalled();

      // But Date SHOULD advance
      const db = getRecurringDb();
      const row = db.prepare('SELECT * FROM recurring_expenses').get() as RecurringExpense;
      expect(row.next_due_date).toBe('2025-02-01');
  });
});

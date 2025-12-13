import { getDb } from '../api/expenses/expenses-db';
import * as fs from 'fs';
import * as path from 'path';

const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');

interface Expense {
  id: number;
  credit: number;
  debit: number;
  description: string;
  date: string;
  category: string;
}

interface FetchExpensesParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  category?: string;
}

interface PaginatedResponse {
  data: Expense[];
  total: number;
  page: number;
  limit: number;
}

export const getYears = () => {
  if (!fs.existsSync(dataDir)) {
    return [];
  }
  const files = fs.readdirSync(dataDir);
  const years = files
    .filter((file) => file.startsWith('expenses-') && file.endsWith('.sqlite'))
    .map((file) =>
      parseInt(file.replace('expenses-', '').replace('.sqlite', ''))
    )
    .sort((a, b) => b - a); // Sort descending (newest first)
  return years;
};

export const fetchExpensesPaginated = (
  params: FetchExpensesParams
): PaginatedResponse | Expense[] => {
  const years = getYears();
  let allYears = years;

  // Filter years if date range is provided
  // This is an optimization to avoid checking years that are definitely out of range
  if (params.startDate || params.endDate) {
    const startYear = params.startDate
      ? new Date(params.startDate).getFullYear()
      : -Infinity;
    const endYear = params.endDate
      ? new Date(params.endDate).getFullYear()
      : Infinity;

    allYears = allYears.filter((year) => year >= startYear && year <= endYear);
  }

  // If page/limit are not provided, fall back to "fetch all" behavior (but with filtering support)
  if (!params.page || !params.limit) {
    let allExpenses: Expense[] = [];
    for (const year of allYears) {
      const db = getDb(year);
      let query = `SELECT id, credit, debit, description, strftime('%Y-%m-%d', date) as date, category FROM expenses`;
      const conditions: string[] = [];
      const args: any[] = [];

      if (params.category) {
        conditions.push('category = ?');
        args.push(params.category);
      }
      if (params.startDate) {
        conditions.push('date >= ?');
        args.push(params.startDate);
      }
      if (params.endDate) {
        conditions.push('date <= ?');
        args.push(params.endDate);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' ORDER BY date DESC';

      const expenses = db.prepare(query).all(...args) as Expense[];
      allExpenses = allExpenses.concat(expenses);
    }
    // Since we concat results from multiple years which are already sorted by year (desc),
    // and within each year we sort by date DESC, the result should be roughly sorted.
    // But to be safe (and because day-level overlap might happen if we didn't sort strictly),
    // we should rely on the natural order of years [2025, 2024] + internal sort.
    return allExpenses;
  }

  const page = params.page || 1;
  const limit = params.limit || 10;
  const offset = (page - 1) * limit;

  // Global Pagination Logic

  // 1. Calculate Total Count (needed for pagination UI)
  let totalCount = 0;
  const yearCounts = new Map<number, number>();

  for (const year of allYears) {
    const db = getDb(year);
    let countQuery = `SELECT COUNT(*) as count FROM expenses`;
    const conditions: string[] = [];
    const args: any[] = [];

    if (params.category) {
      conditions.push('category = ?');
      args.push(params.category);
    }
    if (params.startDate) {
      conditions.push('date >= ?');
      args.push(params.startDate);
    }
    if (params.endDate) {
      conditions.push('date <= ?');
      args.push(params.endDate);
    }

    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }

    const result = db.prepare(countQuery).get(...args) as { count: number };
    totalCount += result.count;
    yearCounts.set(year, result.count);
  }

  // 2. Fetch specific slice
  const results: Expense[] = [];
  let currentOffset = offset;
  let remainingLimit = limit;

  for (const year of allYears) {
    const count = yearCounts.get(year) || 0;

    if (count === 0) continue;

    if (currentOffset >= count) {
      currentOffset -= count;
      continue;
    }

    // We need records from this year
    // Effective offset for this year is currentOffset
    // Effective limit is remainingLimit

    const db = getDb(year);
    let query = `SELECT id, credit, debit, description, strftime('%Y-%m-%d', date) as date, category FROM expenses`;
    const conditions: string[] = [];
    const args: any[] = [];

    if (params.category) {
      conditions.push('category = ?');
      args.push(params.category);
    }
    if (params.startDate) {
      conditions.push('date >= ?');
      args.push(params.startDate);
    }
    if (params.endDate) {
      conditions.push('date <= ?');
      args.push(params.endDate);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY date DESC LIMIT ? OFFSET ?';
    args.push(remainingLimit, currentOffset);

    const expenses = db.prepare(query).all(...args) as Expense[];
    results.push(...expenses);

    remainingLimit -= expenses.length;
    currentOffset = 0; // Reset offset for subsequent years

    if (remainingLimit <= 0) break;
  }

  return {
    data: results,
    total: totalCount,
    page,
    limit,
  };
};

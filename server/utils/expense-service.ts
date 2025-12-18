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
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
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

export interface ExpenseSummary {
  income: number;
  expenses: number;
  byCategory: Record<string, number>;
}

export const getExpenseSummary = (
  params: FetchExpensesParams
): ExpenseSummary => {
  const years = getYears();
  let allYears = years;

  // Filter years if date range is provided
  if (params.startDate || params.endDate) {
    const startYear = params.startDate
      ? new Date(params.startDate).getFullYear()
      : -Infinity;
    const endYear = params.endDate
      ? new Date(params.endDate).getFullYear()
      : Infinity;

    allYears = allYears.filter((year) => year >= startYear && year <= endYear);
  }

  let totalIncome = 0;
  let totalExpenses = 0;
  const byCategory: Record<string, number> = {};

  for (const year of allYears) {
    const db = getDb(year);
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

    const whereClause =
      conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '';

    // Income/Expense Totals
    const totalsQuery = `
      SELECT
        SUM(credit) as income,
        SUM(debit) as expenses
      FROM expenses
      ${whereClause}
    `;
    const totals = db.prepare(totalsQuery).get(...args) as {
      income: number;
      expenses: number;
    };
    totalIncome += totals.income || 0;
    totalExpenses += totals.expenses || 0;

    // Category breakdown (only for expenses)
    let catWhereClause = whereClause;
    if (catWhereClause) {
      catWhereClause += ' AND debit > 0';
    } else {
      catWhereClause = ' WHERE debit > 0';
    }

    const catQuery = `SELECT category, SUM(debit) as total FROM expenses ${catWhereClause} GROUP BY category`;
    const catResults = db.prepare(catQuery).all(...args) as {
      category: string;
      total: number;
    }[];

    for (const row of catResults) {
      byCategory[row.category] = (byCategory[row.category] || 0) + row.total;
    }
  }

  return {
    income: totalIncome,
    expenses: totalExpenses,
    byCategory,
  };
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

  const sortBy = params.sortBy || 'date';
  const sortOrder = params.sortOrder || 'desc';
  const isDefaultSort = sortBy === 'date' && sortOrder === 'desc';

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

    if (!isDefaultSort) {
      allExpenses.sort(compareExpenses(sortBy, sortOrder));
    }
    return allExpenses;
  }

  const page = params.page || 1;
  const limit = params.limit || 10;

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
  if (isDefaultSort) {
    // Optimized path for Date DESC (default)
    const results: Expense[] = [];
    let currentOffset = (page - 1) * limit;
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
  } else {
    // Slow path: fetch all matching, sort, slice
    let allFiltered: Expense[] = [];
    for (const year of allYears) {
        // Skip years with no matches
        if ((yearCounts.get(year) || 0) === 0) continue;

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

        // Use default sort per year
        query += ' ORDER BY date DESC';

        const expenses = db.prepare(query).all(...args) as Expense[];
        allFiltered = allFiltered.concat(expenses);
    }

    // Sort
    allFiltered.sort(compareExpenses(sortBy, sortOrder));

    // Slice
    const startIndex = (page - 1) * limit;
    const sliced = allFiltered.slice(startIndex, startIndex + limit);

    return {
      data: sliced,
      total: totalCount,
      page,
      limit
    };
  }
};

function compareExpenses(sortBy: string, sortOrder: 'asc' | 'desc') {
  return (a: Expense, b: Expense) => {
    let valA: any = a[sortBy as keyof Expense];
    let valB: any = b[sortBy as keyof Expense];

    if (sortBy === 'amount') {
      valA = a.credit - a.debit;
      valB = b.credit - b.debit;
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  };
}

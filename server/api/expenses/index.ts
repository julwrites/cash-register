// /Users/julianteh/julwrites/cash-register/server/api/expenses/index.ts

import { defineEventHandler } from 'h3';
import type { Expense } from './expenses-db';
import { getDb } from './expenses-db';
import * as fs from 'fs';
import * as path from 'path';

const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');

const getYears = () => {
  const files = fs.readdirSync(dataDir);
  console.log('Files in data directory:', files);
  const years = files
    .filter((file) => file.startsWith('expenses-') && file.endsWith('.sqlite'))
    .map((file) =>
      parseInt(file.replace('expenses-', '').replace('.sqlite', ''))
    );
  console.log('Found years:', years);
  return years;
};

export default defineEventHandler(async (_event) => {
  return await fetchExpenses();
});

// Add a function to fetch expenses with formatted date
export async function fetchExpenses(): Promise<Expense[]> {
  console.log('fetchExpenses called');
  const years = getYears();
  console.log('Years:', years);
  let allExpenses: Expense[] = [];
  for (const year of years) {
    console.log('Fetching expenses for year:', year);
    const db = getDb(year);
    const expenses = db
      .prepare(
        `
      SELECT id, credit, debit, description,
        strftime('%Y-%m-%d', date) as date,
        category
      FROM expenses;
    `
      )
      .all();
    console.log('Expenses for year', year, ':', expenses);
    allExpenses = allExpenses.concat(expenses as Expense[]);
  }
  console.log('All expenses:', allExpenses);
  return allExpenses;
}

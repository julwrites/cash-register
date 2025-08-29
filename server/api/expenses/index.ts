// /Users/julianteh/julwrites/cash-register/server/api/expenses/index.ts

import { defineEventHandler, createError } from 'h3';
import { getDb, Expense } from './expenses-db';
import * as fs from 'fs';
import * as path from 'path';

const dataDir = path.join(process.cwd(), 'data');

const getYears = () => {
  const files = fs.readdirSync(dataDir);
  console.log('Files in data directory:', files);
  const years = files
    .filter(file => file.startsWith('expenses-') && file.endsWith('.sqlite'))
    .map(file => parseInt(file.replace('expenses-', '').replace('.sqlite', '')));
  console.log('Found years:', years);
  return years;
};

// Utility function to get error message
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export default defineEventHandler(async (event) => {
  return await fetchExpenses();
});

// Add a function to fetch expenses with formatted date
export async function fetchExpenses(): Promise<Expense[]> {
  const years = getYears();
  let allExpenses: Expense[] = [];
  for (const year of years) {
    const db = await getDb(year);
    const expenses = await db.all(`
      SELECT id, credit, debit, description,
        strftime('%Y-%m-%d', date) as date,
        category
      FROM expenses;
    `);
    allExpenses = allExpenses.concat(expenses as Expense[]);
  }
  return allExpenses;
}

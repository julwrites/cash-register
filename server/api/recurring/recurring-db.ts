import { existsSync, mkdirSync } from 'fs';
import Database from 'better-sqlite3';
import * as path from 'path';
import { getDb as getExpenseDb } from '../expenses/expenses-db';
import { trackDescriptionUsage } from '../descriptions/descriptions-db';

const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

const databasePath = path.join(dataDir, 'recurring.sqlite');

let dbInstance: Database.Database | null = null;

export const getRecurringDb = (): Database.Database => {
  if (dbInstance) return dbInstance;

  try {
    const db = new Database(databasePath);

    db.prepare(
      `
        CREATE TABLE IF NOT EXISTS recurring_expenses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          amount REAL NOT NULL,
          description TEXT NOT NULL,
          category TEXT NOT NULL,
          frequency TEXT NOT NULL,
          next_due_date TEXT NOT NULL,
          active INTEGER DEFAULT 1
        );
      `
    ).run();

    dbInstance = db;
    return db;
  } catch (err) {
    console.error('Error opening recurring database', err);
    throw err;
  }
};

export interface RecurringExpense {
  id?: number;
  amount: number;
  description: string;
  category: string;
  frequency: 'weekly' | 'monthly' | 'yearly';
  next_due_date: string;
  active: boolean | number;
}

interface DBRecurringExpense {
  id: number;
  amount: number;
  description: string;
  category: string;
  frequency: 'weekly' | 'monthly' | 'yearly';
  next_due_date: string;
  active: number;
}

export function getAllRecurring(): RecurringExpense[] {
  const db = getRecurringDb();
  const rows = db.prepare('SELECT * FROM recurring_expenses').all() as DBRecurringExpense[];
  return rows.map(r => ({ ...r, active: !!r.active }));
}

export function addRecurring(item: RecurringExpense) {
  const db = getRecurringDb();
  const stmt = db.prepare(
    `INSERT INTO recurring_expenses (amount, description, category, frequency, next_due_date, active)
     VALUES (?, ?, ?, ?, ?, ?)`
  );
  const info = stmt.run(
    item.amount,
    item.description,
    item.category,
    item.frequency,
    item.next_due_date,
    item.active ? 1 : 0
  );
  return { id: info.lastInsertRowid, ...item };
}

export function updateRecurring(id: number, item: Partial<RecurringExpense>) {
  const db = getRecurringDb();
  const fields: string[] = [];
  const args: any[] = [];

  if (item.amount !== undefined) { fields.push('amount = ?'); args.push(item.amount); }
  if (item.description !== undefined) { fields.push('description = ?'); args.push(item.description); }
  if (item.category !== undefined) { fields.push('category = ?'); args.push(item.category); }
  if (item.frequency !== undefined) { fields.push('frequency = ?'); args.push(item.frequency); }
  if (item.next_due_date !== undefined) { fields.push('next_due_date = ?'); args.push(item.next_due_date); }
  if (item.active !== undefined) { fields.push('active = ?'); args.push(item.active ? 1 : 0); }

  if (fields.length === 0) return;

  args.push(id);
  const stmt = db.prepare(`UPDATE recurring_expenses SET ${fields.join(', ')} WHERE id = ?`);
  stmt.run(...args);
}

export function deleteRecurring(id: number) {
  const db = getRecurringDb();
  db.prepare('DELETE FROM recurring_expenses WHERE id = ?').run(id);
}

export function processRecurringExpenses(): number {
  const db = getRecurringDb();
  // Get active rules where next_due_date is in the past or today
  const today = new Date().toISOString().split('T')[0];

  const rules = db.prepare(
    'SELECT * FROM recurring_expenses WHERE active = 1 AND next_due_date <= ?'
  ).all(today) as DBRecurringExpense[];

  let processedCount = 0;

  for (const rule of rules) {
    const currentDueDate = new Date(rule.next_due_date);
    const todayDate = new Date(today);
    let modifications = 0;

    // Loop to catch up all missed occurrences
    while (currentDueDate <= todayDate) {
      const expenseDateStr = currentDueDate.toISOString().split('T')[0];

      // 1. Create Expense
      const year = parseInt(expenseDateStr.split('-')[0]);
      const expenseDb = getExpenseDb(year);

      try {
        // Check for duplicate before inserting
        // We look for an exact match on date, description, category, and debit amount
        const existing = expenseDb
          .prepare(
            `SELECT 1 FROM expenses WHERE date = ? AND description = ? AND category = ? AND debit = ?`
          )
          .get(expenseDateStr, rule.description, rule.category, rule.amount);

        if (!existing) {
          expenseDb
            .prepare(
              `INSERT INTO expenses (credit, debit, description, date, category) VALUES (?, ?, ?, ?, ?)`
            )
            .run(0, rule.amount, rule.description, expenseDateStr, rule.category);

          trackDescriptionUsage(rule.description, rule.category);
          processedCount++;
        } else {
          // Log that we skipped a duplicate, but we still count it as a "modification" to the rule state
          // so that the next_due_date advances.
          // console.log(`Skipping duplicate recurring expense: ${rule.description} on ${expenseDateStr}`);
        }

        // Always increment modifications so we advance the date
        modifications++;
      } catch (_e) {
        console.error(
          `Failed to process recurring rule ${rule.id} for date ${expenseDateStr}`,
          _e
        );
        break; // Stop processing this rule if error
      }

      // 2. Calculate next due date
      if (rule.frequency === 'weekly') {
        currentDueDate.setDate(currentDueDate.getDate() + 7);
      } else if (rule.frequency === 'monthly') {
        currentDueDate.setMonth(currentDueDate.getMonth() + 1);
      } else if (rule.frequency === 'yearly') {
        currentDueDate.setFullYear(currentDueDate.getFullYear() + 1);
      }
    }

    if (modifications > 0) {
      const nextDateStr = currentDueDate.toISOString().split('T')[0];
      // 3. Update Rule
      db.prepare(
        'UPDATE recurring_expenses SET next_due_date = ? WHERE id = ?'
      ).run(nextDateStr, rule.id);
    }
  }

  return processedCount;
}

// /Users/julianteh/julwrites/cash-register/server/api/expenses/expenses-db.ts

import { existsSync, mkdirSync } from 'fs';
import Database from 'better-sqlite3';
import * as path from 'path';

const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

// Cache connections
const dbCache = new Map<number, Database.Database>();

export const getDb = (year: number): Database.Database => {
  if (dbCache.has(year)) {
    return dbCache.get(year)!;
  }

  console.log('Initializing expenses database connection for year:', year);
  const databasePath = path.join(dataDir, `expenses-${year}.sqlite`);
  const db = new Database(databasePath);
  db.pragma('journal_mode = WAL');

  // Ensure table exists
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        credit DECIMAL(10, 2) DEFAULT 0,
        debit DECIMAL(10, 2) DEFAULT 0,
        description TEXT,
        date DATE,
        category TEXT
      );
    `);
  } catch (err) {
    console.error('Error creating table', err);
    throw err;
  }

  dbCache.set(year, db);
  return db;
};

export interface Expense {
  id?: number;
  credit?: number;
  debit?: number;
  description: string;
  date: string;
  category: string;
}

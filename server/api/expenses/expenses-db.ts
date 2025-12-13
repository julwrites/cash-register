import { existsSync, mkdirSync } from 'fs';
import Database from 'better-sqlite3';
import * as path from 'path';

const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

// Cache for database connections
const dbCache = new Map<number, Database.Database>();

export const getDb = (year: number): Database.Database => {
  if (dbCache.has(year)) {
    return dbCache.get(year)!;
  }

  console.log(`Initializing expenses database connection for year: ${year}`);
  try {
    const databasePath = path.join(dataDir, `expenses-${year}.sqlite`);
    const db = new Database(databasePath);
    console.log(`Connected to the expenses database for year ${year}`);

    // Create table if not exists
    db.prepare(
      `
      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        credit DECIMAL(10, 2) DEFAULT 0,
        debit DECIMAL(10, 2) DEFAULT 0,
        description TEXT,
        date DATE,
        category TEXT
      );
    `
    ).run();

    dbCache.set(year, db);
    return db;
  } catch (err) {
    console.error('Error opening database', err);
    throw err;
  }
};

export interface Expense {
  id?: number;
  credit?: number;
  debit?: number;
  description: string;
  date: string;
  category: string;
}

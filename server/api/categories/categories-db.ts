// /Users/julianteh/julwrites/cash-register/server/api/categories/categories-db.ts

import { existsSync, mkdirSync } from 'fs';
import Database from 'better-sqlite3';
import * as path from 'path';

const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

const databasePath = path.join(dataDir, 'categories.sqlite');

let dbInstance: Database.Database | null = null;

const initializeDatabase = (): Database.Database => {
  try {
    const db = new Database(databasePath);
    db.pragma('journal_mode = WAL');
    console.log('Connected to the categories database');

    db.exec(`
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL
        );
    `);
    return db;
  } catch (err) {
    console.error('Error opening database', err);
    throw err;
  }
};

export const getCategoryDb = (): Database.Database => {
  if (!dbInstance) {
    dbInstance = initializeDatabase();
  }
  return dbInstance;
};

export interface Category {
  id?: number;
  name: string;
}

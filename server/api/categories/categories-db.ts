import { existsSync, mkdirSync } from 'fs';
import Database from 'better-sqlite3';
import * as path from 'path';

const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

const databasePath = path.join(dataDir, 'categories.sqlite');

let dbInstance: Database.Database | null = null;

export const getDb = (): Database.Database => {
  if (dbInstance) return dbInstance;

  console.log('Initializing categories database connection');
  try {
    const db = new Database(databasePath);
    console.log('Connected to the categories database');

    db.prepare(
      `
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL
        );
      `
    ).run();

    dbInstance = db;
    return db;
  } catch (err) {
    console.error('Error opening database', err);
    throw err;
  }
};

export interface Category {
  id?: number;
  name: string;
}

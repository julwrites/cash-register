// /Users/julianteh/julwrites/cash-register/server/api/expenses/expenses-db.ts

import { existsSync, mkdirSync } from 'fs';
import Database from 'better-sqlite3';
import * as path from 'path';

const dataDir = path.join(process.cwd(), 'data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

const dbConnections: { [year: number]: Database.Database } = {};

interface DatabaseOperations {
  run: (...args: any[]) => Promise<any>;
  get: (...args: any[]) => Promise<any>;
  all: (...args: any[]) => Promise<any>;
  db: Database.Database;
}

const initializeDatabase = (year: number): Promise<DatabaseOperations> => {
  return new Promise((resolve: (value: DatabaseOperations) => void, reject) => {
    try {
      const databasePath = path.join(process.cwd(), 'data', `expenses-${year}.sqlite`);
      const db = new Database(databasePath);
      console.log(`Connected to the expenses database for year ${year}`);
      dbConnections[year] = db;

      const dbRun = (...args: any[]) => {
        return new Promise((resolve, reject) => {
          try {
            const result = db.prepare(args[0]).run(...args.slice(1));
            resolve(result);
          } catch (err) {
            reject(err);
          }
        });
      };

      const dbGet = (...args: any[]) => {
        return new Promise((resolve, reject) => {
          try {
            const result = db.prepare(args[0]).get(...args.slice(1));
            resolve(result);
          } catch (err) {
            reject(err);
          }
        });
      };

      const dbAll = (...args: any[]) => {
        return new Promise((resolve, reject) => {
          try {
            const result = db.prepare(args[0]).all(...args.slice(1));
            resolve(result);
          } catch (err) {
            reject(err);
          }
        });
      };

      dbRun(`
        CREATE TABLE IF NOT EXISTS expenses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          credit DECIMAL(10, 2) DEFAULT 0,
          debit DECIMAL(10, 2) DEFAULT 0,
          description TEXT,
          date DATE,
          category TEXT
        );
      `).then(() => {
        resolve({
          run: dbRun,
          get: dbGet,
all: dbAll,
          db
        } as DatabaseOperations);
      }).catch(err => {
        console.error('Error creating table', err);
        reject(err);
      });
    } catch (err) {
      console.error('Error opening database', err);
      reject(err);
    }
  });
};

const dbPromises: { [year: number]: Promise<DatabaseOperations> } = {};

export const getDb = (year: number): Promise<DatabaseOperations> => {
  if (!dbPromises[year]) {
    dbPromises[year] = initializeDatabase(year);
  }
  return dbPromises[year];
};

export interface Expense {
  id?: number;
  credit?: number;
  debit?: number;
  description: string;
  date: string;
  category: string;
}

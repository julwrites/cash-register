// /Users/julianteh/julwrites/cash-register/server/api/expenses/expenses-db.ts

import Database from 'better-sqlite3';
import * as path from 'path';

const databasePath = path.join(process.cwd(), 'data', 'expenses.sqlite');

let db: any;

let dbRun: (...args: any[]) => Promise<any>;
let dbGet: (...args: any[]) => Promise<any>;
let dbAll: (...args: any[]) => Promise<any>;

interface DatabaseOperations {
  run: (...args: any[]) => Promise<any>;
  get: (...args: any[]) => Promise<any>;
  all: (...args: any[]) => Promise<any>;
  db: any;
}

const initializeDatabase = (): Promise<DatabaseOperations> => {
  return new Promise((resolve: (value: DatabaseOperations) => void, reject) => {
    try {
      db = new Database(databasePath);
      console.log('Connected to the expenses database');
      
      // better-sqlite3 is synchronous, so we just wrap in promises
      dbRun = (...args: any[]) => {
        return new Promise((resolve, reject) => {
          try {
            const result = db.prepare(args[0]).run(...args.slice(1));
            resolve(result);
          } catch (err) {
            reject(err);
          }
        });
      };
      
      dbGet = (...args: any[]) => {
        return new Promise((resolve, reject) => {
          try {
            const result = db.prepare(args[0]).get(...args.slice(1));
            resolve(result);
          } catch (err) {
            reject(err);
          }
        });
      };
      
      dbAll = (...args: any[]) => {
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

const dbPromise: Promise<DatabaseOperations> = initializeDatabase();

export default {
  run: async (...args: any[]) => (await dbPromise).run(...args),
  get: async (...args: any[]) => (await dbPromise).get(...args),
  all: async (...args: any[]) => (await dbPromise).all(...args),
  db: async () => (await dbPromise).db
};

export interface Expense {
  id?: number;
  credit?: number;
  debit?: number;
  description: string;
  date: string;
  category: string;
}

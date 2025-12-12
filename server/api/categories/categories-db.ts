// /Users/julianteh/julwrites/cash-register/server/api/categories/categories-db.ts

import { existsSync, mkdirSync } from 'fs';
import Database from 'better-sqlite3';
import * as path from 'path';

const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

const databasePath = path.join(dataDir, 'categories.sqlite');

interface DatabaseOperations {
  run: (...args: any[]) => Promise<any>;
  get: (...args: any[]) => Promise<any>;
  all: (...args: any[]) => Promise<any>;
  db: any;
}

const initializeDatabase = (): Promise<DatabaseOperations> => {
  return new Promise((resolve: (value: DatabaseOperations) => void, reject) => {
    try {
      const db = new Database(databasePath);
      console.log('Connected to the categories database');

      // better-sqlite3 is synchronous, so we just wrap in promises
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
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL
        );
      `)
        .then(() => {
          resolve({
            run: dbRun,
            get: dbGet,
            all: dbAll,
            db,
          } as DatabaseOperations);
        })
        .catch((err) => {
          console.error('Error creating table', err);
          reject(err);
        });
    } catch (err) {
      console.error('Error opening database', err);
      reject(err);
    }
  });
};

let dbPromise: Promise<DatabaseOperations> | null = null;

export default {
  run: async (...args: any[]) => {
    if (!dbPromise) {
      console.log('Initializing categories database connection');
      dbPromise = initializeDatabase();
    }
    console.log('Executing categories query:', args[0]);
    return (await dbPromise).run(...args);
  },
  get: async (...args: any[]) => {
    if (!dbPromise) {
      console.log('Initializing categories database connection');
      dbPromise = initializeDatabase();
    }
    console.log('Executing categories query:', args[0]);
    return (await dbPromise).get(...args);
  },
  all: async (...args: any[]) => {
    if (!dbPromise) {
      console.log('Initializing categories database connection');
      dbPromise = initializeDatabase();
    }
    console.log('Executing categories query:', args[0]);
    return (await dbPromise).all(...args);
  },
  db: async () => {
    if (!dbPromise) {
      console.log('Initializing categories database connection');
      dbPromise = initializeDatabase();
    }
    return (await dbPromise).db;
  },
};

export interface Category {
  id?: number;
  name: string;
}

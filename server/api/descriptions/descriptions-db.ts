import { existsSync, mkdirSync } from 'fs';
import Database from 'better-sqlite3';
import * as path from 'path';

const dataDir = path.join(process.cwd(), 'data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

interface DatabaseOperations {
  run: (...args: any[]) => Promise<any>;
  get: (...args: any[]) => Promise<any>;
  all: (...args: any[]) => Promise<any>;
  db: Database.Database;
}

const initializeDatabase = (): Promise<DatabaseOperations> => {
  console.log('Initializing descriptions database connection');
  return new Promise((resolve: (value: DatabaseOperations) => void, reject) => {
    try {
      const databasePath = path.join(process.cwd(), 'data', 'descriptions.sqlite');
      const db = new Database(databasePath);
      console.log('Connected to the descriptions database');

      const dbRun = (...args: any[]) => {
        console.log('Executing descriptions query:', args[0]);
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
        console.log('Executing descriptions query:', args[0]);
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
        console.log('Executing descriptions query:', args[0]);
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
        CREATE TABLE IF NOT EXISTS description_usage (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          description TEXT UNIQUE NOT NULL,
          last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          usage_count INTEGER DEFAULT 1
        );
      `).then(() => {
        // Create index for faster sorting
        return dbRun(`
          CREATE INDEX IF NOT EXISTS idx_description_usage_sort
          ON description_usage (last_used DESC, usage_count DESC);
        `);
      }).then(() => {
        resolve({
          run: dbRun,
          get: dbGet,
          all: dbAll,
          db
        } as DatabaseOperations);
      }).catch(err => {
        console.error('Error creating table or index', err);
        reject(err);
      });
    } catch (err) {
      console.error('Error opening database', err);
      reject(err);
    }
  });
};

export const getDescriptionDb = (): Promise<DatabaseOperations> => {
  console.log('Getting descriptions database');
  return initializeDatabase();
};

export const trackDescriptionUsage = async (description: string): Promise<void> => {
  try {
    const db = await getDescriptionDb();
    await db.run(`
      INSERT INTO description_usage (description, last_used, usage_count)
      VALUES (?, CURRENT_TIMESTAMP, 1)
      ON CONFLICT(description)
      DO UPDATE SET
        last_used = CURRENT_TIMESTAMP,
        usage_count = usage_count + 1
    `, description);
    console.log(`Tracked description usage: "${description}"`);
  } catch (err) {
    console.error('Error tracking description usage:', err);
    // Don't throw error to avoid breaking expense creation
  }
};
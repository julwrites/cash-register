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
  console.log('Initializing settings database connection');
  return new Promise((resolve: (value: DatabaseOperations) => void, reject) => {
    try {
      const databasePath = path.join(process.cwd(), 'data', 'settings.sqlite');
      const db = new Database(databasePath);
      console.log('Connected to the settings database');

      const dbRun = (...args: any[]) => {
        console.log('Executing settings query:', args[0]);
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
        console.log('Executing settings query:', args[0]);
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
        console.log('Executing settings query:', args[0]);
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
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `).then(() => {
        return dbRun(`
          INSERT OR IGNORE INTO settings (key, value)
          VALUES ('migration_schedule', '{"enabled":true,"time":"00:00","frequency":"daily"}');
        `);
      }).then(() => {
        resolve({
          run: dbRun,
          get: dbGet,
          all: dbAll,
          db
        } as DatabaseOperations);
      }).catch(err => {
        console.error('Error creating settings table', err);
        reject(err);
      });
    } catch (err) {
      console.error('Error opening settings database', err);
      reject(err);
    }
  });
};

export const getSettingsDb = (): Promise<DatabaseOperations> => {
  console.log('Getting settings database');
  return initializeDatabase();
};

export interface MigrationSchedule {
  enabled: boolean;
  time: string;
  frequency: 'daily' | 'weekly' | 'monthly';
}

export const getMigrationSchedule = async (): Promise<MigrationSchedule> => {
  try {
    const db = await getSettingsDb();
    const result: any = await db.get(`
      SELECT value FROM settings WHERE key = 'migration_schedule'
    `);
    
    if (result && result.value) {
      return JSON.parse(result.value);
    }
    
    return {
      enabled: true,
      time: '00:00',
      frequency: 'daily'
    };
  } catch (err) {
    console.error('Error getting migration schedule:', err);
    return {
      enabled: true,
      time: '00:00',
      frequency: 'daily'
    };
  }
};

export const setMigrationSchedule = async (schedule: MigrationSchedule): Promise<void> => {
  try {
    const db = await getSettingsDb();
    await db.run(`
      INSERT OR REPLACE INTO settings (key, value, updated_at)
      VALUES ('migration_schedule', ?, CURRENT_TIMESTAMP)
    `, JSON.stringify(schedule));
    console.log('Migration schedule updated:', schedule);
  } catch (err) {
    console.error('Error setting migration schedule:', err);
    throw err;
  }
};

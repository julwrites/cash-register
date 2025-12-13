import { existsSync, mkdirSync } from 'fs';
import Database from 'better-sqlite3';
import * as path from 'path';

const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

let dbInstance: Database.Database | null = null;

export const getSettingsDb = (): Database.Database => {
  if (dbInstance) return dbInstance;

  console.log('Initializing settings database connection');
  try {
    const databasePath = path.join(dataDir, 'settings.sqlite');
    const db = new Database(databasePath);
    console.log('Connected to the settings database');

    db.prepare(
      `
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `
    ).run();

    db.prepare(
      `
          INSERT OR IGNORE INTO settings (key, value)
          VALUES ('migration_schedule', '{"enabled":true,"time":"00:00","frequency":"daily"}');
        `
    ).run();

    dbInstance = db;
    return db;
  } catch (err) {
    console.error('Error opening database', err);
    throw err;
  }
};

export interface MigrationSchedule {
  enabled: boolean;
  time: string;
  frequency: 'daily' | 'weekly' | 'monthly';
}

export const getMigrationSchedule = (): MigrationSchedule => {
  try {
    const db = getSettingsDb();
    const result = db
      .prepare(
        `
      SELECT value FROM settings WHERE key = 'migration_schedule'
    `
      )
      .get() as { value: string } | undefined;

    if (result && result.value) {
      return JSON.parse(result.value);
    }

    return {
      enabled: true,
      time: '00:00',
      frequency: 'daily',
    };
  } catch (err) {
    console.error('Error getting migration schedule:', err);
    return {
      enabled: true,
      time: '00:00',
      frequency: 'daily',
    };
  }
};

export const setMigrationSchedule = (schedule: MigrationSchedule): void => {
  try {
    const db = getSettingsDb();
    db.prepare(
      `
      INSERT OR REPLACE INTO settings (key, value, updated_at)
      VALUES ('migration_schedule', ?, CURRENT_TIMESTAMP)
    `
    ).run(JSON.stringify(schedule));
    console.log('Migration schedule updated:', schedule);
  } catch (err) {
    console.error('Error setting migration schedule:', err);
    throw err;
  }
};

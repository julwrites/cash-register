// /Users/julianteh/julwrites/cash-register/server/api/descriptions/descriptions-db.ts

import { existsSync, mkdirSync } from 'fs';
import Database from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';
import { getDb as getExpenseDb } from '../expenses/expenses-db';

const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

export interface MigrationResult {
  totalDescriptions: number;
  totalUsageCount: number;
  yearsProcessed: number[];
}

const runMigrationLogic = (
  descriptionsDb: Database.Database
): MigrationResult => {
  // Clear the table to ensure idempotency
  descriptionsDb.exec('DELETE FROM description_usage');

  const getYears = (): number[] => {
    const files = fs.readdirSync(dataDir);
    const years = files
      .filter(
        (file) => file.startsWith('expenses-') && file.endsWith('.sqlite')
      )
      .map((file) =>
        parseInt(file.replace('expenses-', '').replace('.sqlite', ''))
      );
    return years;
  };

  const years = getYears();
  console.log(`Found expense databases for years: ${years.join(', ')}`);

  let totalDescriptions = 0;
  let totalUsageCount = 0;

  for (const year of years) {
    const expenseDbPath = path.join(dataDir, `expenses-${year}.sqlite`);

    if (!existsSync(expenseDbPath)) {
      console.log(`Skipping year ${year} - database file not found`);
      continue;
    }

    console.log(`Processing expenses for year ${year}...`);
    const expenseDb = getExpenseDb(year);

    try {
      // Get all descriptions with their usage count and last used date
      const descriptions = expenseDb
        .prepare(
          `
        SELECT
          description,
          COUNT(*) as usage_count,
          MAX(date) as last_used
        FROM expenses
        WHERE description IS NOT NULL AND description != ''
        GROUP BY description
      `
        )
        .all() as any[];

      console.log(
        `Found ${descriptions.length} unique descriptions for year ${year}`
      );

      // Insert or update in descriptions database
      const insertStmt = descriptionsDb.prepare(`
          INSERT INTO description_usage (description, last_used, usage_count)
          VALUES (?, ?, ?)
          ON CONFLICT(description)
          DO UPDATE SET
            last_used = CASE
              WHEN excluded.last_used > description_usage.last_used THEN excluded.last_used
              ELSE description_usage.last_used
            END,
            usage_count = description_usage.usage_count + excluded.usage_count
        `);

      const transaction = descriptionsDb.transaction((descriptions: any[]) => {
        for (const desc of descriptions) {
          insertStmt.run(desc.description, desc.last_used, desc.usage_count);
        }
      });

      transaction(descriptions);

      totalDescriptions += descriptions.length;
      totalUsageCount += descriptions.reduce(
        (sum, desc) => sum + desc.usage_count,
        0
      );

      console.log(
        `Migrated ${descriptions.length} descriptions for year ${year}`
      );
    } catch (error) {
      console.error(`Error processing year ${year}:`, error);
      // Continue with other years even if one fails
    }
  }

  return {
    totalDescriptions,
    totalUsageCount,
    yearsProcessed: years,
  };
};

let dbInstance: Database.Database | null = null;

const initializeDatabase = (): Database.Database => {
  console.log('Initializing descriptions database connection');
  try {
    const databasePath = path.join(dataDir, 'descriptions.sqlite');
    const db = new Database(databasePath);
    db.pragma('journal_mode = WAL');
    console.log('Connected to the descriptions database');

    db.exec(`
        CREATE TABLE IF NOT EXISTS description_usage (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          description TEXT UNIQUE NOT NULL,
          last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          usage_count INTEGER DEFAULT 1
        );
        CREATE INDEX IF NOT EXISTS idx_description_usage_sort
          ON description_usage (last_used DESC, usage_count DESC);
      `);

    const row = db
      .prepare('SELECT COUNT(*) as count FROM description_usage')
      .get() as { count: number };

    if (row && row.count === 0) {
      console.log('Description usage table is empty, running migration...');
      runMigrationLogic(db);
      console.log('Migration finished.');
    }

    return db;
  } catch (err) {
    console.error('Error opening database', err);
    throw err;
  }
};

export const getDescriptionDb = (): Database.Database => {
  if (!dbInstance) {
    dbInstance = initializeDatabase();
  }
  return dbInstance;
};

export const trackDescriptionUsage = (description: string): void => {
  try {
    const db = getDescriptionDb();
    db.prepare(
      `
      INSERT INTO description_usage (description, last_used, usage_count)
      VALUES (?, CURRENT_TIMESTAMP, 1)
      ON CONFLICT(description)
      DO UPDATE SET
        last_used = CURRENT_TIMESTAMP,
        usage_count = usage_count + 1
    `
    ).run(description);
    console.log(`Tracked description usage: "${description}"`);
  } catch (err) {
    console.error('Error tracking description usage:', err);
    // Don't throw error to avoid breaking expense creation
  }
};

export const migrateDescriptionUsage = (): MigrationResult => {
  const descriptionsDb = getDescriptionDb();
  return runMigrationLogic(descriptionsDb);
};

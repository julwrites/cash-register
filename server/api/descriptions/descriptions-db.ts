import { existsSync, mkdirSync } from 'fs';
import Database from 'better-sqlite3';
import * as path from 'path';
import { getDb as getExpenseDb } from '../expenses/expenses-db';
import * as fs from 'fs';

const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

let dbInstance: Database.Database | null = null;

export const getDescriptionDb = (): Database.Database => {
  if (dbInstance) return dbInstance;

  console.log('Initializing descriptions database connection');
  const databasePath = path.join(dataDir, 'descriptions.sqlite');
  const db = new Database(databasePath);
  console.log('Connected to the descriptions database');

  db.prepare(
    `
      CREATE TABLE IF NOT EXISTS description_usage (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT UNIQUE NOT NULL,
        last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        usage_count INTEGER DEFAULT 1,
        last_category TEXT
      );
  `
  ).run();

  try {
    db.prepare(
      'ALTER TABLE description_usage ADD COLUMN last_category TEXT'
    ).run();
  } catch (_error) {
    // Column likely already exists
  }

  db.prepare(
    `
      CREATE INDEX IF NOT EXISTS idx_description_usage_sort
      ON description_usage (last_used DESC, usage_count DESC);
  `
  ).run();

  // Check if migration needed
  const row = db
    .prepare(`SELECT COUNT(*) as count FROM description_usage`)
    .get() as { count: number };
  if (row && row.count === 0) {
    console.log('Description usage table is empty, running migration...');
    runMigrationLogic(db);
    console.log('Migration finished.');
  }

  dbInstance = db;
  return db;
};

interface MigrationResult {
  totalDescriptions: number;
  totalUsageCount: number;
  yearsProcessed: number[];
}

const runMigrationLogic = (
  descriptionsDb: Database.Database
): MigrationResult => {
  // Clear the table
  descriptionsDb.prepare(`DELETE FROM description_usage`).run();

  const getYears = (): number[] => {
    if (!fs.existsSync(dataDir)) return [];
    const files = fs.readdirSync(dataDir);
    return files
      .filter(
        (file) => file.startsWith('expenses-') && file.endsWith('.sqlite')
      )
      .map((file) =>
        parseInt(file.replace('expenses-', '').replace('.sqlite', ''))
      );
  };

  const years = getYears();
  let totalDescriptions = 0;
  let totalUsageCount = 0;

  for (const year of years) {
    const expenseDbPath = path.join(dataDir, `expenses-${year}.sqlite`);
    if (!fs.existsSync(expenseDbPath)) continue;

    try {
      const expenseDb = getExpenseDb(year);
      // SQLite Note: When using MAX(date) with GROUP BY, the other non-aggregated columns
      // (like category) are taken from the row that matches the MAX value.
      const descriptions = expenseDb
        .prepare(
          `
              SELECT
                description,
                COUNT(*) as usage_count,
                MAX(date) as last_used,
                category
              FROM expenses
              WHERE description IS NOT NULL AND description != ''
              GROUP BY description
           `
        )
        .all() as any[];

      const stmt = descriptionsDb.prepare(`
              INSERT INTO description_usage (description, last_used, usage_count, last_category)
              VALUES (?, ?, ?, ?)
              ON CONFLICT(description)
              DO UPDATE SET
                  last_used = CASE
                    WHEN excluded.last_used > description_usage.last_used THEN excluded.last_used
                    ELSE description_usage.last_used
                  END,
                  last_category = CASE
                    WHEN excluded.last_used > description_usage.last_used THEN excluded.last_category
                    ELSE description_usage.last_category
                  END,
                  usage_count = description_usage.usage_count + excluded.usage_count
           `);

      const insertMany = descriptionsDb.transaction((descs: any[]) => {
        for (const desc of descs) {
          stmt.run(
            desc.description,
            desc.last_used,
            desc.usage_count,
            desc.category
          );
        }
      });

      insertMany(descriptions);

      totalDescriptions += descriptions.length;
      totalUsageCount += descriptions.reduce(
        (sum, desc) => sum + desc.usage_count,
        0
      );
    } catch (error) {
      console.error(`Error processing year ${year}:`, error);
    }
  }

  return { totalDescriptions, totalUsageCount, yearsProcessed: years };
};

export const trackDescriptionUsage = (
  description: string,
  category: string
): void => {
  try {
    const db = getDescriptionDb();
    db.prepare(
      `
            INSERT INTO description_usage (description, last_used, usage_count, last_category)
            VALUES (?, CURRENT_TIMESTAMP, 1, ?)
            ON CONFLICT(description)
            DO UPDATE SET
                last_used = CURRENT_TIMESTAMP,
                usage_count = usage_count + 1,
                last_category = excluded.last_category
        `
    ).run(description, category);
    console.log(
      `Tracked description usage: "${description}" with category "${category}"`
    );
  } catch (err) {
    console.error('Error tracking description usage:', err);
  }
};

export const migrateDescriptionUsage = (): MigrationResult => {
  const db = getDescriptionDb();
  return runMigrationLogic(db);
};

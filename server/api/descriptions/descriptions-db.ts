import { existsSync, mkdirSync } from 'fs';
import Database from 'better-sqlite3';
import * as path from 'path';

const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

interface DatabaseOperations {
  run: (...args: any[]) => Promise<any>;
  get: (...args: any[]) => Promise<any>;
  all: (...args: any[]) => Promise<any>;
  db: Database.Database;
}

interface MigrationResult {
  totalDescriptions: number;
  totalUsageCount: number;
  yearsProcessed: number[];
}

const runMigrationLogic = async (
  descriptionsDb: DatabaseOperations
): Promise<MigrationResult> => {
  // Clear the table to ensure idempotency
  await descriptionsDb.run(`DELETE FROM description_usage`);

  const { getDb } = await import('../expenses/expenses-db');
  const fs = await import('fs');
  const path = await import('path');

  const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');

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

    if (!fs.existsSync(expenseDbPath)) {
      console.log(`Skipping year ${year} - database file not found`);
      continue;
    }

    console.log(`Processing expenses for year ${year}...`);
    const expenseDb = await getDb(year);

    try {
      // Get all descriptions with their usage count and last used date
      const descriptions = await expenseDb.all(`
        SELECT
          description,
          COUNT(*) as usage_count,
          MAX(date) as last_used
        FROM expenses
        WHERE description IS NOT NULL AND description != ''
        GROUP BY description
      `);

      console.log(
        `Found ${descriptions.length} unique descriptions for year ${year}`
      );

      // Insert or update in descriptions database
      for (const desc of descriptions) {
        await descriptionsDb.run(
          `
          INSERT INTO description_usage (description, last_used, usage_count)
          VALUES (?, ?, ?)
          ON CONFLICT(description)
          DO UPDATE SET
            last_used = CASE
              WHEN excluded.last_used > description_usage.last_used THEN excluded.last_used
              ELSE description_usage.last_used
            END,
            usage_count = description_usage.usage_count + excluded.usage_count
        `,
          desc.description,
          desc.last_used,
          desc.usage_count
        );
      }

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

let dbPromise: Promise<DatabaseOperations> | null = null;

const initializeDatabase = (): Promise<DatabaseOperations> => {
  console.log('Initializing descriptions database connection');
  return new Promise((resolve: (value: DatabaseOperations) => void, reject) => {
    try {
      const databasePath = path.join(dataDir, 'descriptions.sqlite');
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

      const dbOperations = {
        run: dbRun,
        get: dbGet,
        all: dbAll,
        db,
      } as DatabaseOperations;

      dbRun(`
        CREATE TABLE IF NOT EXISTS description_usage (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          description TEXT UNIQUE NOT NULL,
          last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          usage_count INTEGER DEFAULT 1
        );
      `)
        .then(() => {
          // Create index for faster sorting
          return dbRun(`
          CREATE INDEX IF NOT EXISTS idx_description_usage_sort
          ON description_usage (last_used DESC, usage_count DESC);
        `);
        })
        .then(() => {
          return dbGet(`SELECT COUNT(*) as count FROM description_usage`);
        })
        .then((row: any) => {
          if (row && row.count === 0) {
            console.log(
              'Description usage table is empty, running migration...'
            );
            return runMigrationLogic(dbOperations).then(() => {
              console.log('Migration finished.');
            });
          }
        })
        .then(() => {
          resolve(dbOperations);
        })
        .catch((err) => {
          console.error('Error during database initialization', err);
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
  if (!dbPromise) {
    dbPromise = initializeDatabase();
  }
  return dbPromise;
};

export const trackDescriptionUsage = async (
  description: string
): Promise<void> => {
  try {
    const db = await getDescriptionDb();
    await db.run(
      `
      INSERT INTO description_usage (description, last_used, usage_count)
      VALUES (?, CURRENT_TIMESTAMP, 1)
      ON CONFLICT(description)
      DO UPDATE SET
        last_used = CURRENT_TIMESTAMP,
        usage_count = usage_count + 1
    `,
      description
    );
    console.log(`Tracked description usage: "${description}"`);
  } catch (err) {
    console.error('Error tracking description usage:', err);
    // Don't throw error to avoid breaking expense creation
  }
};

export const migrateDescriptionUsage = async (): Promise<MigrationResult> => {
  const descriptionsDb = await getDescriptionDb();
  return runMigrationLogic(descriptionsDb);
};

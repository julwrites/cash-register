#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, readdirSync } from 'fs';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const dataDir = join(projectRoot, 'data');

const getDescriptionDb = () => {
  const databasePath = join(dataDir, 'descriptions.sqlite');
  const db = new Database(databasePath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS description_usage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT UNIQUE NOT NULL,
      last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      usage_count INTEGER DEFAULT 1
    );
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_description_usage_sort
    ON description_usage (last_used DESC, usage_count DESC);
  `);

  return db;
};

const getExpenseDb = (year) => {
  const databasePath = join(dataDir, `expenses-${year}.sqlite`);
  return new Database(databasePath);
};

const getYears = () => {
  const files = readdirSync(dataDir);
  return files
    .filter((file) => file.startsWith('expenses-') && file.endsWith('.sqlite'))
    .map((file) =>
      parseInt(file.replace('expenses-', '').replace('.sqlite', ''))
    );
};

const migrateDescriptions = () => {
  const startTime = Date.now();
  console.log(
    `[${new Date().toISOString()}] Starting description migration...`
  );

  const years = getYears();
  console.log(`Found expense databases for years: ${years.join(', ')}`);

  let totalDescriptions = 0;
  let totalUsageCount = 0;

  const descriptionsDb = getDescriptionDb();

  for (const year of years) {
    const expenseDbPath = join(dataDir, `expenses-${year}.sqlite`);

    if (!existsSync(expenseDbPath)) {
      console.log(`Skipping year ${year} - database file not found`);
      continue;
    }

    console.log(`Processing expenses for year ${year}...`);
    const expenseDb = getExpenseDb(year);

    try {
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
        .all();

      console.log(
        `Found ${descriptions.length} unique descriptions for year ${year}`
      );

      const stmt = descriptionsDb.prepare(`
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

      for (const desc of descriptions) {
        stmt.run(desc.description, desc.last_used, desc.usage_count);
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
    } finally {
      expenseDb.close();
    }
  }

  descriptionsDb.close();

  const duration = Date.now() - startTime;
  console.log(
    `[${new Date().toISOString()}] Migration completed in ${duration}ms`
  );
  console.log(`Total unique descriptions: ${totalDescriptions}`);
  console.log(`Total usage count: ${totalUsageCount}`);
  console.log(`Years processed: ${years.join(', ')}`);
};

try {
  migrateDescriptions();
  process.exit(0);
} catch (error) {
  console.error('Migration failed:', error);
  process.exit(1);
}

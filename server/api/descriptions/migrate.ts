import { defineEventHandler, createError } from 'h3';
import jwt from 'jsonwebtoken';
import { getDescriptionDb } from './descriptions-db';
import { getDb } from '../expenses/expenses-db';
import * as fs from 'fs';
import * as path from 'path';

const secretKey = process.env.AUTH_SECRET;

const dataDir = path.join(process.cwd(), 'data');

const getYears = (): number[] => {
  const files = fs.readdirSync(dataDir);
  const years = files
    .filter(file => file.startsWith('expenses-') && file.endsWith('.sqlite'))
    .map(file => parseInt(file.replace('expenses-', '').replace('.sqlite', '')));
  return years;
};

interface MigrationResult {
  success: boolean;
  message: string;
  statistics?: {
    totalDescriptions: number;
    totalUsageCount: number;
    yearsProcessed: number[];
    migrationTime: string;
  };
  error?: string;
}

export default defineEventHandler(async (event): Promise<MigrationResult> => {
  // Authentication check
  const token = event.req.headers.authorization?.split(' ')[1];
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, secretKey) as any;
    if (!decoded.isAdmin) {
      throw createError({ statusCode: 403, statusMessage: 'Forbidden' });
    }

    console.log('Description migration triggered by admin user:', decoded.username);

    const years = getYears();
    console.log(`Found expense databases for years: ${years.join(', ')}`);

    let totalDescriptions = 0;
    let totalUsageCount = 0;
    const startTime = Date.now();

    const descriptionsDb = await getDescriptionDb();

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

        console.log(`Found ${descriptions.length} unique descriptions for year ${year}`);

        // Insert or update in descriptions database
        for (const desc of descriptions) {
          await descriptionsDb.run(`
            INSERT INTO description_usage (description, last_used, usage_count)
            VALUES (?, ?, ?)
            ON CONFLICT(description)
            DO UPDATE SET
              last_used = CASE
                WHEN excluded.last_used > description_usage.last_used THEN excluded.last_used
                ELSE description_usage.last_used
              END,
              usage_count = description_usage.usage_count + excluded.usage_count
          `, desc.description, desc.last_used, desc.usage_count);
        }

        totalDescriptions += descriptions.length;
        totalUsageCount += descriptions.reduce((sum, desc) => sum + desc.usage_count, 0);

        console.log(`Migrated ${descriptions.length} descriptions for year ${year}`);

      } catch (error) {
        console.error(`Error processing year ${year}:`, error);
        // Continue with other years even if one fails
      }
    }

    const migrationTime = Date.now() - startTime;

    // Verify the migration
    const finalCount = await descriptionsDb.get('SELECT COUNT(*) as count FROM description_usage');
    const totalUsage = await descriptionsDb.get('SELECT SUM(usage_count) as total FROM description_usage');

    console.log('Migration completed successfully');
    console.log(`Total unique descriptions: ${finalCount.count}`);
    console.log(`Total usage count: ${totalUsage.total}`);
    console.log(`Migration time: ${migrationTime}ms`);

    return {
      success: true,
      message: 'Description migration completed successfully',
      statistics: {
        totalDescriptions: totalDescriptions,
        totalUsageCount: totalUsageCount,
        yearsProcessed: years,
        migrationTime: `${migrationTime}ms`
      }
    };

  } catch (error) {
    console.error('Migration API error:', error);
    return {
      success: false,
      message: 'Migration failed',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
});
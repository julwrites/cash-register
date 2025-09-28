import { defineEventHandler, createError } from 'h3';
import jwt from 'jsonwebtoken';
import { migrateDescriptionUsage } from './descriptions-db';

const secretKey = process.env.AUTH_SECRET;

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

    const startTime = Date.now();
    const migrationResult = await migrateDescriptionUsage();
    const migrationTime = Date.now() - startTime;

    console.log('Migration completed successfully');
    console.log(`Total unique descriptions: ${migrationResult.totalDescriptions}`);
    console.log(`Total usage count: ${migrationResult.totalUsageCount}`);
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
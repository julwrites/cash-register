import { defineEventHandler } from 'h3';
import { migrateDescriptionUsage } from './descriptions-db';
import { requireAdmin } from '../../utils/auth';

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
  const session = await requireAdmin(event);

  try {
    console.log(
      'Description migration triggered by admin user:',
      session.user.username
    );

    const startTime = Date.now();
    const migrationResult = await migrateDescriptionUsage();
    const migrationTime = Date.now() - startTime;

    console.log('Migration completed successfully');
    console.log(
      `Total unique descriptions: ${migrationResult.totalDescriptions}`
    );
    console.log(`Total usage count: ${migrationResult.totalUsageCount}`);
    console.log(`Migration time: ${migrationTime}ms`);

    return {
      success: true,
      message: 'Description migration completed successfully',
      statistics: {
        totalDescriptions: migrationResult.totalDescriptions,
        totalUsageCount: migrationResult.totalUsageCount,
        yearsProcessed: migrationResult.yearsProcessed,
        migrationTime: `${migrationTime}ms`,
      },
    };
  } catch (error) {
    console.error('Migration API error:', error);
    return {
      success: false,
      message: 'Migration failed',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
});
